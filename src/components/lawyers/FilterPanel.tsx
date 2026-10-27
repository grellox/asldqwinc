import { useState, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { ThinBars } from '../charts/ThinBars';
import type { Lawyer, Modalidad } from '../../types';

export interface MarketFilters {
  specialties: string[];
  districts: string[];
  modalidades: Modalidad[];
  languages: string[];
  experience: string[];
  maxPrice: number;
  topRated: boolean;
  availableOnly: boolean;
}

export const experienceBuckets: { id: string; label: string; test: (l: Lawyer) => boolean }[] = [
  { id: '0-5', label: '0 a 5 años', test: (l) => l.yearsExperience <= 5 },
  { id: '6-10', label: '6 a 10 años', test: (l) => l.yearsExperience >= 6 && l.yearsExperience <= 10 },
  { id: '11-15', label: '11 a 15 años', test: (l) => l.yearsExperience >= 11 && l.yearsExperience <= 15 },
  { id: '16+', label: '16 años o más', test: (l) => l.yearsExperience >= 16 },
];

export const MIN_RATING = 4.7;

export function emptyFilters(maxPrice: number): MarketFilters {
  return {
    specialties: [],
    districts: [],
    modalidades: [],
    languages: [],
    experience: [],
    maxPrice,
    topRated: false,
    availableOnly: false,
  };
}

export function countActive(filters: MarketFilters, priceCeiling: number) {
  return (
    filters.specialties.length +
    filters.districts.length +
    filters.modalidades.length +
    filters.languages.length +
    filters.experience.length +
    (filters.maxPrice < priceCeiling ? 1 : 0) +
    (filters.topRated ? 1 : 0) +
    (filters.availableOnly ? 1 : 0)
  );
}

interface FilterPanelProps {
  /** Pool the counts are computed from: everything matching the text search. */
  pool: Lawyer[];
  filters: MarketFilters;
  onChange: (filters: MarketFilters) => void;
  priceFloor: number;
  priceCeiling: number;
}

export function FilterPanel({ pool, filters, onChange, priceFloor, priceCeiling }: FilterPanelProps) {
  const activeCount = countActive(filters, priceCeiling);

  function toggle<K extends 'specialties' | 'districts' | 'modalidades' | 'languages' | 'experience'>(
    key: K,
    value: MarketFilters[K][number]
  ) {
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value as string];
    onChange({ ...filters, [key]: next } as MarketFilters);
  }

  const count = (test: (l: Lawyer) => boolean) => pool.filter(test).length;

  const specialties = Array.from(new Set(pool.flatMap((l) => l.specialties))).sort((a, b) =>
    a.localeCompare(b, 'es')
  );
  const districts = Array.from(new Set(pool.map((l) => l.district))).sort((a, b) => a.localeCompare(b, 'es'));
  const languages = Array.from(new Set(pool.flatMap((l) => l.languages))).sort((a, b) =>
    a.localeCompare(b, 'es')
  );

  // Price distribution behind the slider, like the rate histogram in the reference.
  const bins = 12;
  const span = Math.max(priceCeiling - priceFloor, 1);
  const histogram = Array.from({ length: bins }, (_, i) => {
    const from = priceFloor + (span / bins) * i;
    const to = priceFloor + (span / bins) * (i + 1);
    return pool.filter((l) => l.pricePerHito >= from && (i === bins - 1 ? l.pricePerHito <= to : l.pricePerHito < to))
      .length;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-[17px] font-bold text-ink">
          Filtros
          {activeCount > 0 && <span className="ml-1.5 text-sm font-semibold text-link">({activeCount})</span>}
        </h2>
        <button
          type="button"
          onClick={() => onChange(emptyFilters(priceCeiling))}
          disabled={activeCount === 0}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-link transition-opacity hover:underline disabled:opacity-40 disabled:hover:no-underline focus-visible:focus-ring"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restablecer
        </button>
      </div>

      <Section title="Precio por hito">
        <ThinBars data={histogram} height={44} barColor="#4A8CF0" />
        <input
          type="range"
          min={priceFloor}
          max={priceCeiling}
          step={5}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          aria-label="Precio máximo por hito"
          className="mt-2 w-full accent-brand focus-visible:focus-ring"
        />
        <div className="flex items-center justify-between text-xs text-[#475569]">
          <span>S/ {priceFloor}</span>
          <span className="font-semibold text-ink">
            {filters.maxPrice >= priceCeiling ? `S/ ${priceCeiling} y +` : `Hasta S/ ${filters.maxPrice}`}
          </span>
        </div>
      </Section>

      <Section title="Experiencia">
        {experienceBuckets.map((b) => (
          <Facet
            key={b.id}
            label={b.label}
            count={count(b.test)}
            checked={filters.experience.includes(b.id)}
            onChange={() => toggle('experience', b.id)}
          />
        ))}
      </Section>

      <Section title="Especialidad">
        <FacetList
          items={specialties.map((s) => ({
            key: s,
            label: s,
            count: count((l) => l.specialties.includes(s)),
            checked: filters.specialties.includes(s),
            onChange: () => toggle('specialties', s),
          }))}
        />
      </Section>

      <Section title="Distrito">
        <FacetList
          items={districts.map((d) => ({
            key: d,
            label: d,
            count: count((l) => l.district === d),
            checked: filters.districts.includes(d),
            onChange: () => toggle('districts', d),
          }))}
        />
      </Section>

      <Section title="Modalidad">
        {(['Presencial', 'Virtual', 'Ambas'] as Modalidad[]).map((m) => (
          <Facet
            key={m}
            label={m}
            count={count((l) => l.modalidad === m)}
            checked={filters.modalidades.includes(m)}
            onChange={() => toggle('modalidades', m)}
          />
        ))}
      </Section>

      <Section title="Idiomas" hint="Atienden la consulta en este idioma.">
        <FacetList
          items={languages.map((lang) => ({
            key: lang,
            label: lang,
            count: count((l) => l.languages.includes(lang)),
            checked: filters.languages.includes(lang),
            onChange: () => toggle('languages', lang),
          }))}
        />
      </Section>

      <Section title="Calificación y agenda">
        <Facet
          label={`${MIN_RATING} estrellas o más`}
          count={count((l) => l.rating >= MIN_RATING)}
          checked={filters.topRated}
          onChange={() => onChange({ ...filters, topRated: !filters.topRated })}
        />
        <Facet
          label="Acepta casos nuevos"
          count={count((l) => l.acceptingClients)}
          checked={filters.availableOnly}
          onChange={() => onChange({ ...filters, availableOnly: !filters.availableOnly })}
        />
      </Section>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="border-t border-[#E2E8F0] pt-4">
      <p className="font-sans text-sm font-bold text-ink">{title}</p>
      {hint && <p className="mt-0.5 text-xs text-[#475569]">{hint}</p>}
      <div className="mt-2.5 flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

interface FacetProps {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}

function Facet({ label, count, checked, onChange }: FacetProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 text-sm ${
        count === 0 && !checked ? 'text-[#94A3B8]' : 'text-[#334155]'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 rounded border-[#CBD5E1] text-brand focus-visible:focus-ring"
      />
      <span className="min-w-0 flex-1 truncate" title={label}>
        {label}
      </span>
      <span className="shrink-0 text-xs text-[#475569]">({count})</span>
    </label>
  );
}

/** Long facet lists collapse to five rows, like the reference's "See more". */
function FacetList({ items }: { items: (FacetProps & { key: string })[] }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 5;
  const visible = expanded ? items : items.slice(0, limit);
  const hidden = items.length - visible.length;

  return (
    <>
      {visible.map(({ key, ...facet }) => (
        <Facet key={key} {...facet} />
      ))}
      {(hidden > 0 || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-fit text-sm font-semibold text-link hover:underline focus-visible:focus-ring"
        >
          {expanded ? 'Ver menos' : `Ver más (${hidden})`}
        </button>
      )}
    </>
  );
}
