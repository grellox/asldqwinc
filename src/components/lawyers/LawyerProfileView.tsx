import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Building2,
  Check,
  Clock,
  Gavel,
  GraduationCap,
  Laptop,
  MapPin,
  Share2,
  ShieldCheck,
  Star,
  Users,
  Wallet,
} from 'lucide-react';
import { Card, CardBlock, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LawyerCard } from '../cards/LawyerCard';
import { LawyerMonogram } from './LawyerMonogram';
import { RequestModal } from './RequestModal';
import { applyProfile, hitoBreakdown, lawyers, MY_LAWYER_ID, responseLabel } from '../../data/lawyers';
import { isActiveRequest, useAppStore } from '../../store/useAppStore';
import type { Lawyer, LawyerReview } from '../../types';

const modalidadNote: Record<Lawyer['modalidad'], string> = {
  Presencial: 'Atiende en su oficina y acompaña a las audiencias presenciales.',
  Virtual: 'Atiende por videollamada y mensajería, sin reuniones presenciales.',
  Ambas: 'Se adapta: puedes reunirte en su oficina o por videollamada.',
};

interface LawyerProfileViewProps {
  mode: 'public' | 'mother';
}

export function LawyerProfileView({ mode }: LawyerProfileViewProps) {
  const { id } = useParams();
  const lawyerProfile = useAppStore((s) => s.lawyerProfile);
  const requests = useAppStore((s) => s.requests);
  const pendingRequestLawyerId = useAppStore((s) => s.pendingRequestLawyerId);
  const setPendingRequestLawyer = useAppStore((s) => s.setPendingRequestLawyer);
  const navigate = useNavigate();

  const [requestOpen, setRequestOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sections = {
    sobre: useRef<HTMLDivElement>(null),
    experiencia: useRef<HTMLDivElement>(null),
    resenas: useRef<HTMLDivElement>(null),
    formacion: useRef<HTMLDivElement>(null),
  };

  const backHref = mode === 'mother' ? '/madre/abogados' : '/directorio';
  const seed = lawyers.find((l) => l.id === id);
  // An unlisted lawyer is invisible in the marketplace, profile page included.
  const lawyer =
    seed && (seed.id !== MY_LAWYER_ID || lawyerProfile.listed) ? applyProfile(seed, lawyerProfile) : undefined;

  const alreadyRequested = requests.some((r) => r.lawyerId === lawyer?.id && isActiveRequest(r));

  // Picked up after signing in from a public "Solicitar asesoría".
  useEffect(() => {
    if (mode !== 'mother' || !lawyer || pendingRequestLawyerId !== lawyer.id) return;
    setPendingRequestLawyer(null);
    if (!alreadyRequested) setRequestOpen(true);
  }, [mode, lawyer, pendingRequestLawyerId, setPendingRequestLawyer, alreadyRequested]);

  if (!lawyer) {
    return (
      <Card>
        <CardTitle>Este perfil no está disponible</CardTitle>
        <p className="mt-1.5 text-sm text-[#475569]">El abogado que buscas ya no figura en el directorio.</p>
        <Link to={backHref} className="mt-4 inline-block">
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver al marketplace
          </Button>
        </Link>
      </Card>
    );
  }

  const requested = alreadyRequested;
  const firstName = lawyer.name.replace(/^(Dra?\.)\s*/, '').split(' ')[0];

  // Same specialty, still taking cases — the "also match your criteria" strip of the reference.
  const alsoMatch = lawyers
    .filter(
      (l) =>
        l.id !== lawyer.id &&
        l.acceptingClients &&
        (l.id !== MY_LAWYER_ID || lawyerProfile.listed) &&
        l.specialties.some((s) => lawyer.specialties.includes(s))
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  function scrollTo(ref: React.RefObject<HTMLDivElement>) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function shareProfile() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[920px] flex-col gap-4">
      <Link
        to={backHref}
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-link hover:underline focus-visible:focus-ring"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al marketplace
      </Link>

      <Card>
        <div className="flex flex-col gap-5 md:flex-row">
          <LawyerMonogram
            lawyer={lawyer}
            size="profile"
            className="h-36 w-full shrink-0 rounded-block md:w-36"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-link">{lawyer.name}</p>
            <h1 className="mt-0.5 font-sans text-xl font-bold leading-snug text-ink">{lawyer.headline}</h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#475569]">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <Wallet className="h-4 w-4 text-[#94A3B8]" /> S/ {lawyer.pricePerHito}/hito
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#94A3B8]" /> {lawyer.district}, Arequipa
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#94A3B8]" /> {lawyer.yearsExperience} años de ejercicio
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-star text-star" />
                {lawyer.rating.toFixed(1)} ({lawyer.reviewsCount} reseñas)
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="success">
                <ShieldCheck className="h-3.5 w-3.5" /> Verificado por el CAA
              </Badge>
              {lawyer.specialties.map((s) => (
                <Badge key={s} tone="brand">
                  {s}
                </Badge>
              ))}
              {!lawyer.acceptingClients && <Badge tone="warn">Agenda llena</Badge>}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 md:w-56">
            <p className="flex items-center gap-1.5 text-xs text-[#475569] md:justify-center">
              <Clock className="h-3.5 w-3.5" /> {responseLabel(lawyer.responseHours)} en promedio
            </p>

            {!lawyer.acceptingClients ? (
              <span className="flex min-h-[44px] items-center justify-center rounded-[10px] bg-[#F1F5F9] px-4 text-center text-sm font-semibold text-[#475569]">
                No acepta casos nuevos
              </span>
            ) : mode === 'public' ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setPendingRequestLawyer(lawyer.id);
                  navigate('/ingresar');
                }}
              >
                Solicitar asesoría
              </Button>
            ) : (
              <Button
                variant={requested ? 'secondary' : 'primary'}
                className={`w-full ${requested ? '!border-transparent !bg-tint !text-brand-ink hover:!bg-tint' : ''}`}
                onClick={() => setRequestOpen(true)}
                disabled={requested}
              >
                {requested ? 'Solicitud enviada ✓' : 'Solicitar asesoría'}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-[#475569]"
              icon={copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              onClick={shareProfile}
            >
              {copied ? 'Enlace copiado' : 'Compartir perfil'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2 py-1">
        <span className="text-sm text-[#475569]">Ir a:</span>
        {[
          { label: 'Sobre mí', ref: sections.sobre },
          { label: 'Experiencia', ref: sections.experiencia },
          { label: 'Reseñas', ref: sections.resenas },
          { label: 'Formación', ref: sections.formacion },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => scrollTo(item.ref)}
            className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#15202E] focus-visible:focus-ring"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div ref={sections.sobre}>
        <Card>
          <CardTitle>Sobre {firstName}</CardTitle>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-link">Descripción</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-[#334155]">{lawyer.about}</p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-link">
            Áreas de especialidad
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {lawyer.specialties.map((s) => (
              <span key={s} className="rounded-[6px] bg-tint-soft px-2.5 py-1 text-xs text-brand-ink">
                {s}
              </span>
            ))}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-link">Idiomas</p>
          <div className="mt-2 flex flex-wrap gap-8">
            {lawyer.languageLevels.map((l) => (
              <div key={l.language}>
                <p className="font-sans text-sm font-bold text-ink">{l.language}</p>
                <p className="text-xs text-[#475569]">{l.level}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-link">Modalidad de atención</p>
          <p className="mt-2 flex items-center gap-2 font-sans text-sm font-bold text-ink">
            <Laptop className="h-4 w-4 text-brand" /> {lawyer.modalidad}
          </p>
          <p className="text-xs text-[#475569]">{modalidadNote[lawyer.modalidad]}</p>
        </Card>
      </div>

      <div ref={sections.experiencia}>
        <Card>
          <CardTitle>Experiencia</CardTitle>
          <div className="mt-4 flex flex-col">
            {lawyer.experience.map((exp, i) => (
              <div
                key={`${exp.org}-${exp.period}`}
                className={i > 0 ? 'mt-5 border-t border-[#E2E8F0] pt-5' : ''}
              >
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-block bg-canvas">
                    <Building2 className="h-4 w-4 text-[#475569]" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-sans text-[15px] font-bold text-ink">{exp.org}</p>
                    <p className="text-sm text-[#334155]">{exp.role}</p>
                    <p className="mt-0.5 text-xs text-[#475569]">
                      {exp.period} ({exp.durationLabel})
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {exp.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-[6px] bg-tint-soft px-2 py-1 text-xs text-brand-ink"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <ul className="mt-2.5 flex flex-col gap-1.5">
                      {exp.highlights.map((h) => (
                        <li key={h} className="text-sm text-[#475569]">
                          · {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.1em] text-link">
            Donde litiga habitualmente
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {lawyer.courts.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-[#334155]">
                <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
                {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardTitle>Trayectoria en cifras</CardTitle>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Casos atendidos', value: `${lawyer.casesCount}`, hint: 'en alimentos' },
            { label: 'Sentencias favorables', value: `${lawyer.successRate} %`, hint: 'casos cerrados' },
            { label: 'Duración promedio', value: `${lawyer.avgResolutionMonths} meses`, hint: 'desde la demanda' },
            { label: 'Experiencia', value: `${lawyer.yearsExperience} años`, hint: 'de ejercicio' },
          ].map((stat) => (
            <CardBlock key={stat.label}>
              <p className="font-serif text-[26px] font-medium leading-none text-ink">{stat.value}</p>
              <p className="mt-1.5 font-sans text-xs font-bold text-ink">{stat.label}</p>
              <p className="text-xs text-[#475569]">{stat.hint}</p>
            </CardBlock>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Cómo se pagan los {lawyer.hitos} hitos</CardTitle>
        <p className="mt-1 text-sm text-[#475569]">
          Cada pago queda en custodia y se libera solo cuando la etapa se cumple. Total estimado:{' '}
          <span className="font-semibold text-ink">S/ {lawyer.pricePerHito * lawyer.hitos}</span>.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {hitoBreakdown.map((h, i) => (
            <CardBlock key={h.label}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-ink">
                  {i + 1}. {h.label}
                </p>
                <span className="shrink-0 font-sans text-sm font-bold text-ink">S/ {lawyer.pricePerHito}</span>
              </div>
              <p className="mt-1 text-sm text-[#475569]">{h.description}</p>
            </CardBlock>
          ))}
        </div>
      </Card>

      <div ref={sections.resenas}>
        <Card>
          <CardTitle>Reseñas de clientas</CardTitle>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#475569]">
            <span className="flex items-center gap-1 font-sans text-base font-bold text-ink">
              <Star className="h-4 w-4 fill-star text-star" /> {lawyer.rating.toFixed(1)}
            </span>
            de 5 · {lawyer.reviewsCount} calificaciones verificadas de casos cerrados en Syloop.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {lawyer.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} lawyerName={lawyer.name} />
            ))}
          </div>
        </Card>
      </div>

      {alsoMatch.length > 0 && (
        <Card>
          <CardTitle>Otros abogados que también coinciden</CardTitle>
          <p className="mt-1 text-sm text-[#475569]">
            Trabajan las mismas especialidades y aceptan casos nuevos.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {alsoMatch.map((l) => (
              <LawyerCard
                key={l.id}
                lawyer={l}
                compact
                profileHref={`${mode === 'mother' ? '/madre/abogados' : '/directorio'}/${l.id}`}
              />
            ))}
          </div>
        </Card>
      )}

      <div ref={sections.formacion}>
        <Card>
          <CardTitle>Formación</CardTitle>
          <div className="mt-4 flex flex-col gap-4">
            {lawyer.education.map((e) => (
              <div key={`${e.degree}-${e.year}`} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-block bg-canvas">
                  <GraduationCap className="h-4 w-4 text-[#475569]" />
                </span>
                <div>
                  <p className="font-sans text-[15px] font-bold text-ink">{e.degree}</p>
                  <p className="text-sm text-[#334155]">{e.institution}</p>
                  <p className="text-xs text-[#475569]">{e.year}</p>
                </div>
              </div>
            ))}
          </div>

          {lawyer.certifications.length > 0 && (
            <>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.1em] text-link">Acreditaciones</p>
              <ul className="mt-2 flex flex-col gap-2">
                {lawyer.certifications.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-[#334155]">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {c}
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="mt-6 flex items-center gap-2 text-xs text-[#475569]">
            <Users className="h-3.5 w-3.5" /> Colegiatura {lawyer.caaNumber}, verificada con el Colegio de
            Abogados de Arequipa.
          </p>
        </Card>
      </div>

      {mode === 'mother' && (
        <RequestModal open={requestOpen} onClose={() => setRequestOpen(false)} lawyer={lawyer} />
      )}
    </div>
  );
}

function ReviewItem({ review, lawyerName }: { review: LawyerReview; lawyerName: string }) {
  return (
    <CardBlock>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-sans text-sm font-bold text-ink">{review.authorName}</p>
          <p className="mt-0.5 text-xs text-[#475569]">
            {review.caseType} · {review.dateLabel}
          </p>
        </div>
        <span className="flex items-center gap-0.5" aria-label={`${review.rating} de 5 estrellas`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-star text-star' : 'text-[#CBD5E1]'}`}
            />
          ))}
        </span>
      </div>

      <p className="mt-2.5 text-sm text-[#334155]">{review.text}</p>

      {review.reply && (
        <div className="mt-3 border-l-2 border-tint-border pl-3">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-link">
            Respuesta de {lawyerName}
          </p>
          <p className="mt-1 text-sm text-[#475569]">{review.reply}</p>
        </div>
      )}
    </CardBlock>
  );
}
