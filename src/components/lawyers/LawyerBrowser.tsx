import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Scale, Search, SlidersHorizontal, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { LawyerCard } from '../cards/LawyerCard';
import { RequestModal } from './RequestModal';
import { MyRequests } from './MyRequests';
import { CompareTable } from './CompareTable';
import {
  countActive,
  emptyFilters,
  experienceBuckets,
  FilterPanel,
  MIN_RATING,
  type MarketFilters,
} from './FilterPanel';
import { applyProfile, lawyers, MY_LAWYER_ID } from '../../data/lawyers';
import { isActiveRequest, useAppStore } from '../../store/useAppStore';
import type { Lawyer } from '../../types';

const PAGE_SIZE = 12;

type SortKey = 'recomendados' | 'precio-asc' | 'precio-desc' | 'rating' | 'respuesta' | 'casos';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'recomendados', label: 'Recomendados' },
  { value: 'precio-asc', label: 'Precio: menor primero' },
  { value: 'precio-desc', label: 'Precio: mayor primero' },
  { value: 'rating', label: 'Mejor calificados' },
  { value: 'respuesta', label: 'Responden más rápido' },
  { value: 'casos', label: 'Más casos atendidos' },
];

/** Accent- and case-insensitive, so "pension" also matches "Pensión". */
function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

interface LawyerBrowserProps {
  mode: 'public' | 'mother';
}

export function LawyerBrowser({ mode }: LawyerBrowserProps) {
  const compareIds = useAppStore((s) => s.compareIds);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const requests = useAppStore((s) => s.requests);
  const lawyerProfile = useAppStore((s) => s.lawyerProfile);
  const setPendingRequestLawyer = useAppStore((s) => s.setPendingRequestLawyer);
  const navigate = useNavigate();

  // The signed-in lawyer edits their own listing from /abogado/perfil, so the marketplace
  // reads the seed data with those edits applied — and drops them when they unlist.
  const listed = useMemo(
    () =>
      lawyers
        .filter((l) => l.id !== MY_LAWYER_ID || lawyerProfile.listed)
        .map((l) => applyProfile(l, lawyerProfile)),
    [lawyerProfile]
  );

  const priceFloor = useMemo(() => Math.min(...listed.map((l) => l.pricePerHito)), [listed]);
  const priceCeiling = useMemo(() => Math.max(...listed.map((l) => l.pricePerHito)), [listed]);

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<MarketFilters>(() => emptyFilters(priceCeiling));
  const [sort, setSort] = useState<SortKey>('recomendados');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  // Text search narrows the pool the facet counts are computed from.
  const pool = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return listed;
    return listed.filter((l) =>
      normalize(
        [l.name, l.headline, l.district, l.bio, l.specialties.join(' '), l.languages.join(' ')].join(' ')
      ).includes(needle)
    );
  }, [listed, query]);

  const filtered = useMemo(() => {
    const matches = pool.filter((l) => {
      if (filters.specialties.length && !filters.specialties.some((s) => l.specialties.includes(s))) return false;
      if (filters.districts.length && !filters.districts.includes(l.district)) return false;
      if (filters.modalidades.length && !filters.modalidades.includes(l.modalidad)) return false;
      if (filters.languages.length && !filters.languages.some((lang) => l.languages.includes(lang))) return false;
      if (
        filters.experience.length &&
        !experienceBuckets.filter((b) => filters.experience.includes(b.id)).some((b) => b.test(l))
      ) {
        return false;
      }
      if (l.pricePerHito > filters.maxPrice) return false;
      if (filters.topRated && l.rating < MIN_RATING) return false;
      if (filters.availableOnly && !l.acceptingClients) return false;
      return true;
    });

    const comparators: Record<SortKey, (a: Lawyer, b: Lawyer) => number> = {
      recomendados: (a, b) => b.rating - a.rating || a.responseHours - b.responseHours,
      'precio-asc': (a, b) => a.pricePerHito - b.pricePerHito,
      'precio-desc': (a, b) => b.pricePerHito - a.pricePerHito,
      rating: (a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount,
      respuesta: (a, b) => a.responseHours - b.responseHours,
      casos: (a, b) => b.casesCount - a.casesCount,
    };

    // Lawyers with a full agenda stay visible but never take the top spots.
    return [...matches].sort(
      (a, b) => Number(b.acceptingClients) - Number(a.acceptingClients) || comparators[sort](a, b)
    );
  }, [pool, filters, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const requestedIds = useMemo(
    () => requests.filter(isActiveRequest).map((r) => r.lawyerId),
    [requests]
  );
  const comparedLawyers = listed.filter((l) => compareIds.includes(l.id));
  const requestingLawyer = listed.find((l) => l.id === requestingId) ?? null;
  const profileBase = mode === 'mother' ? '/madre/abogados' : '/directorio';
  const activeCount = countActive(filters, priceCeiling);

  /** Visitors without a session are sent to sign in, and we remember who they wanted. */
  function handleRequest(lawyerId: string) {
    if (mode === 'mother') {
      setRequestingId(lawyerId);
      return;
    }
    setPendingRequestLawyer(lawyerId);
    navigate('/ingresar');
  }

  const panel = (
    <FilterPanel
      pool={pool}
      filters={filters}
      onChange={setFilters}
      priceFloor={priceFloor}
      priceCeiling={priceCeiling}
    />
  );

  return (
    <div className="flex flex-col gap-6 pb-24">
      {mode === 'mother' && <MyRequests />}

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#94A3B8]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca por nombre, especialidad, distrito o idioma…"
            aria-label="Buscar abogados"
            className="min-h-[48px] w-full rounded-[10px] border border-[#E2E8F0] bg-white pl-10 pr-10 text-[15px] text-ink focus-visible:focus-ring"
          />
          {query && (
            <button
              type="button"
              aria-label="Borrar búsqueda"
              onClick={() => setQuery('')}
              className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-[#475569] hover:bg-[#F1F5F9] focus-visible:focus-ring"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <Button
          variant="secondary"
          className="lg:hidden"
          icon={<SlidersHorizontal className="h-4 w-4" />}
          onClick={() => setFiltersOpen(true)}
        >
          Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-card border border-[#E2E8F0] bg-white p-5">
            {panel}
          </div>
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#475569]">
              <span className="font-sans font-bold text-ink">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'abogado disponible' : 'abogados disponibles'}
              {query.trim() && <> para «{query.trim()}»</>}
            </p>
            <div className="w-full sm:w-56">
              <Select
                aria-label="Ordenar resultados"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {visible.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-[#475569]">Ningún abogado coincide con tu búsqueda.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setFilters(emptyFilters(priceCeiling));
                }}
              >
                Limpiar búsqueda y filtros
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((l) => (
                <LawyerCard
                  key={l.id}
                  lawyer={l}
                  showCompare
                  compared={compareIds.includes(l.id)}
                  onToggleCompare={toggleCompare}
                  compareDisabled={compareIds.length >= 3 && !compareIds.includes(l.id)}
                  requested={mode === 'mother' ? requestedIds.includes(l.id) : false}
                  onRequest={handleRequest}
                  profileHref={`${profileBase}/${l.id}`}
                  unavailable={!l.acceptingClients}
                />
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-sm text-[#475569]">
                {(currentPage - 1) * PAGE_SIZE + 1} – {Math.min(currentPage * PAGE_SIZE, filtered.length)} de{' '}
                {filtered.length} resultados
              </p>
              {pageCount > 1 && (
                <nav className="flex items-center gap-1" aria-label="Paginación">
                  <PageButton
                    label="Página anterior"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </PageButton>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-current={n === currentPage ? 'page' : undefined}
                      onClick={() => setPage(n)}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-semibold transition-colors focus-visible:focus-ring ${
                        n === currentPage ? 'bg-ink text-white' : 'text-[#475569] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <PageButton
                    label="Página siguiente"
                    disabled={currentPage === pageCount}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </PageButton>
                </nav>
              )}
            </div>
          )}
        </div>
      </div>

      {compareIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] sm:px-8">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-ink">{compareIds.length} de 3 seleccionados</span>
            <button
              type="button"
              onClick={clearCompare}
              className="w-fit text-xs font-semibold text-link hover:underline focus-visible:focus-ring"
            >
              Quitar todos
            </button>
          </div>
          <Button variant="primary" icon={<Scale className="h-4 w-4" />} onClick={() => setCompareOpen(true)}>
            Comparar
          </Button>
        </div>
      )}

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros">
        {panel}
        <Button variant="primary" className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>
          Ver {filtered.length} {filtered.length === 1 ? 'abogado' : 'abogados'}
        </Button>
      </Modal>

      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} title="Comparar abogados" wide>
        <CompareTable lawyers={comparedLawyers} />
      </Modal>

      {mode === 'mother' && (
        <RequestModal
          open={requestingId !== null}
          onClose={() => setRequestingId(null)}
          lawyer={requestingLawyer}
        />
      )}
    </div>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-[#475569] transition-colors hover:bg-[#F1F5F9] disabled:opacity-30 disabled:hover:bg-transparent focus-visible:focus-ring"
    >
      {children}
    </button>
  );
}
