import { Link } from 'react-router-dom';
import { Bookmark, Clock, MapPin, Star, Wallet } from 'lucide-react';
import { Button } from '../ui/Button';
import { LawyerMonogram } from '../lawyers/LawyerMonogram';
import { responseLabel } from '../../data/lawyers';
import type { Lawyer } from '../../types';

interface LawyerCardProps {
  lawyer: Lawyer;
  compact?: boolean;
  showCompare?: boolean;
  compared?: boolean;
  onToggleCompare?: (id: string) => void;
  /** The compare tray is full, so this card cannot be added to it. */
  compareDisabled?: boolean;
  requested?: boolean;
  /** Opens the request flow (a form, not an instant toggle). */
  onRequest?: (id: string) => void;
  /** When set, the request CTA is a plain navigation link (public/anonymous context) instead of a stateful button. */
  requestHref?: string;
  /** Route to this lawyer's full profile, when the context has one. */
  profileHref?: string;
  /** The lawyer is listed but has paused new cases, so the request CTA is replaced by a notice. */
  unavailable?: boolean;
}

export function LawyerCard({
  lawyer,
  compact = false,
  showCompare = false,
  compared = false,
  onToggleCompare,
  compareDisabled = false,
  requested = false,
  onRequest,
  requestHref,
  profileHref,
  unavailable = false,
}: LawyerCardProps) {
  const visibleChips = lawyer.specialties.slice(0, compact ? 2 : 4);
  const hiddenChips = lawyer.specialties.length - visibleChips.length;

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-[#E2E8F0] bg-white transition-shadow hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)]">
      <div className="relative">
        {profileHref ? (
          <Link to={profileHref} aria-label={`Ver el perfil de ${lawyer.name}`} className="block">
            <LawyerMonogram lawyer={lawyer} className="aspect-[4/3]" />
          </Link>
        ) : (
          <LawyerMonogram lawyer={lawyer} className="aspect-[4/3]" />
        )}

        {!unavailable && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#166534] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            Disponible
          </span>
        )}
        {unavailable && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#92400E] shadow-sm">
            Agenda llena
          </span>
        )}

        {showCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare?.(lawyer.id)}
            disabled={compareDisabled}
            aria-pressed={compared}
            title={compareDisabled ? 'Ya tienes 3 abogados seleccionados' : 'Añadir a la comparación'}
            aria-label={compared ? `Quitar a ${lawyer.name} de la comparación` : `Comparar a ${lawyer.name}`}
            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors focus-visible:focus-ring disabled:opacity-40 ${
              compared ? 'bg-brand text-white' : 'bg-white/95 text-[#475569] hover:text-ink'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${compared ? 'fill-white' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          {profileHref ? (
            <Link
              to={profileHref}
              className="rounded text-sm font-semibold text-link hover:underline focus-visible:focus-ring"
            >
              {lawyer.name}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-link">{lawyer.name}</p>
          )}
          <p className="mt-0.5 font-sans text-[15px] font-bold leading-snug text-ink">{lawyer.headline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#475569]">
          <span className="flex items-center gap-1 font-semibold text-ink">
            <Wallet className="h-3.5 w-3.5 text-[#94A3B8]" /> S/ {lawyer.pricePerHito}/hito
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#94A3B8]" /> {lawyer.district}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-star text-star" />
            {lawyer.rating.toFixed(1)} ({lawyer.reviewsCount})
          </span>
          {lawyer.responseHours <= 2 && (
            <span className="flex items-center gap-1 text-brand-ink">
              <Clock className="h-3.5 w-3.5" /> {responseLabel(lawyer.responseHours)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {visibleChips.map((s) => (
            <span
              key={s}
              title={s}
              className="max-w-[150px] truncate rounded-[6px] bg-tint-soft px-2 py-1 text-xs text-brand-ink"
            >
              {s}
            </span>
          ))}
          {hiddenChips > 0 && (
            <span className="rounded-[6px] bg-[#F1F5F9] px-2 py-1 text-xs text-[#475569]">+{hiddenChips}</span>
          )}
        </div>

        {!compact && (
          <div className="mt-auto flex items-center gap-2 pt-2">
            {unavailable ? (
              <span className="flex min-h-[38px] flex-1 items-center justify-center rounded-[10px] bg-[#F1F5F9] px-3 text-center text-xs font-semibold text-[#475569]">
                No acepta casos nuevos
              </span>
            ) : requestHref ? (
              <Link to={requestHref} className="flex-1">
                <Button variant="primary" size="sm" className="w-full">
                  Solicitar asesoría
                </Button>
              </Link>
            ) : (
              <Button
                variant={requested ? 'secondary' : 'primary'}
                size="sm"
                className={`flex-1 ${requested ? '!border-transparent !bg-tint !text-brand-ink hover:!bg-tint' : ''}`}
                onClick={() => onRequest?.(lawyer.id)}
              >
                {requested ? 'Solicitud enviada ✓' : 'Solicitar asesoría'}
              </Button>
            )}
            {profileHref && (
              <Link to={profileHref} className="shrink-0">
                <Button variant="secondary" size="sm">
                  Ver perfil
                </Button>
              </Link>
            )}
          </div>
        )}

        {compact && profileHref && (
          <Link to={profileHref} className="mt-auto pt-1 text-sm font-semibold text-link hover:underline">
            Ver perfil →
          </Link>
        )}
      </div>
    </article>
  );
}
