import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Quote,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LawyerCard } from '../../components/cards/LawyerCard';
import { Walkthrough } from '../../components/landing/Walkthrough';
import { media } from '../../data/media';
import { districtCatalogue, featuredLawyers, lawyers, specialtyCatalogue } from '../../data/lawyers';

/* Figures quoted on the page come from the directory itself, so copy and data never drift. */
const priceFloor = Math.min(...lawyers.map((l) => l.pricePerHito));
const priceCeiling = Math.max(...lawyers.map((l) => l.pricePerHito));
const averageMonths = Math.round(
  lawyers.reduce((sum, l) => sum + l.avgResolutionMonths, 0) / lawyers.length
);

/** The real sequence of a pensión de alimentos case, with the milestones that carry a payment. */
const stages = [
  {
    month: 'Mes 0',
    name: 'Demanda presentada',
    text: 'Tu abogado la redacta con tus documentos y la presenta.',
    milestone: 1,
  },
  {
    month: 'Mes 1',
    name: 'Notificación',
    text: 'El juzgado avisa al demandado. Seguimos el CEJ por ti.',
    milestone: null,
  },
  {
    month: 'Mes 3',
    name: 'Audiencia única',
    text: 'Se intenta conciliar. Si no hay acuerdo, se actúan las pruebas.',
    milestone: 2,
  },
  {
    month: 'Mes 6',
    name: 'Sentencia',
    text: 'El juzgado fija el monto y desde cuándo se debe.',
    milestone: 3,
  },
  {
    month: `Mes ${averageMonths}`,
    name: 'Ejecución',
    text: 'Si no paga, se liquidan los atrasos y se pide descuento por planilla.',
    milestone: 4,
  },
];

/* The title above already says the IA drafts and a lawyer signs, so these two add
   what the title cannot: who approves, and what stays on the record. */
const supervisionPoints = [
  'Un abogado colegiado aprueba cada escrito antes de que salga.',
  'Queda registrado quién revisó cada documento y cuándo.',
];

const faqs = [
  {
    q: '¿Cuánto cuesta usar Syloop?',
    a: 'Crear la cuenta y ver el directorio no cuesta nada. Pagas solo los honorarios del abogado que elijas, por hitos.',
  },
  {
    q: '¿Cómo sé que el abogado es de verdad?',
    a: 'En su perfil ves su número de colegiatura del CAA, los juzgados donde litiga y sus reseñas.',
  },
  {
    q: '¿Puedo usar Syloop si mi proceso ya empezó?',
    a: 'Sí. Subes lo que ya tienes, lo sincronizamos con el CEJ y sigues desde donde estés.',
  },
  {
    q: '¿El demandado se entera de lo que escribo aquí?',
    a: 'No. Lo que escribes aquí lo ven tú y tu abogado. Al juzgado solo llega lo que él presenta.',
  },
];

/** One tap into the directory, already filtered — the plain-language way in. */
const quickSearches = [
  { label: 'Pensión de alimentos', specialty: 'Pensión de alimentos' },
  { label: 'El padre no paga', specialty: 'Ejecución de sentencias' },
  { label: 'Violencia familiar', specialty: 'Violencia familiar' },
];

const testimonials = [
  { lawyerId: 'quispe', reviewId: 'rev-quispe-1' },
  { lawyerId: 'chavez', reviewId: 'rev-chavez-1' },
  { lawyerId: 'valdivia', reviewId: 'rev-valdivia-1' },
].map(({ lawyerId, reviewId }) => {
  const lawyer = lawyers.find((l) => l.id === lawyerId)!;
  return { lawyer, review: lawyer.reviews.find((r) => r.id === reviewId)! };
});

export function Landing() {
  return (
    <>
      <Hero />
      <Ruta />
      <PorDentro />
      <Supervision />
      <Abogados />
      <Testimonios />
      <LawyerBand />
      <Faq />
      <FinalCta />
    </>
  );
}

/* ---------------------------------------------------------------- shell */

/** Every section shares this shell, which is what keeps the page in one key. */
function Section({
  id,
  eyebrow,
  title,
  tone = 'white',
  children,
}: {
  id?: string;
  /** Left out when the title already names the section, so nothing is said twice. */
  eyebrow?: string;
  title: ReactNode;
  tone?: 'white' | 'canvas';
  children: ReactNode;
}) {
  return (
    <section id={id} className={`py-24 ${tone === 'canvas' ? 'bg-canvas' : 'bg-white'}`}>
      <div className="page-shell">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2
          className={`max-w-3xl text-balance font-serif text-[34px] font-medium leading-[1.1] text-ink sm:text-[42px] ${
            eyebrow ? 'mt-3' : ''
          }`}
        >
          {title}
        </h2>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

/**
 * A photograph, framed on the page grid and captioned. It is the page's one
 * visual device: photos never sit behind type, they sit beside it and say
 * what they are — the same plain-language promise the product makes.
 */
function Plate({
  src,
  alt,
  caption,
  imgClassName,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  caption: ReactNode;
  imgClassName: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={className}>
      <img
        src={src}
        alt={alt}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`rounded-card bg-canvas ${imgClassName}`}
      />
      <figcaption className="plate-caption">{caption}</figcaption>
    </figure>
  );
}

function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ----------------------------------------------------------------- hero */

/**
 * The photograph is the hero, and the hero is the whole screen: it runs full
 * bleed from the very top of the page down to the fold, behind the bar, which
 * turns transparent over it. The frame is mirrored so the woman falls under the
 * headline and the phone, the drawings and the folder of papers stay open on
 * the right. The type sits on the vertical centre of the frame, so the photograph
 * breathes above and below it instead of being pushed against one edge.
 */
function Hero() {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState('all');
  const [district, setDistrict] = useState('all');

  function goToDirectory(nextSpecialty: string, nextDistrict: string) {
    const params = new URLSearchParams();
    if (nextSpecialty !== 'all') params.set('especialidad', nextSpecialty);
    if (nextDistrict !== 'all') params.set('distrito', nextDistrict);
    const query = params.toString();
    navigate(query ? `/directorio?${query}` : '/directorio');
  }

  return (
    <section className="hero-screen relative -mt-16 flex flex-col overflow-hidden bg-ink pt-16">
      <img
        src={media.heroPhoto}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover object-[center_60%]"
      />
      <div aria-hidden="true" className="hero-veil absolute inset-0" />

      <div className="page-shell relative flex flex-1 flex-col justify-center py-12 sm:py-16">
        <div className="w-full">
          {/* Wide enough to run on one line once the measure allows it, so the
              sentence is read in one go instead of broken across the column. */}
          <h1 className="max-w-2xl text-balance font-serif text-[42px] font-medium leading-[1.04] tracking-[-0.02em] text-white sm:text-[54px] xl:max-w-none xl:text-wrap xl:text-[46px]">
            Encuentra a tu abogado de <span className="text-sky">alimentos</span> en Arequipa
          </h1>
          <p className="mt-6 max-w-lg text-pretty text-[17px] leading-relaxed text-[#CBD5E1]">
            Comparar es gratis. Pagas solo cuando aceptas un presupuesto.
          </p>

          <div className="mt-9 max-w-2xl overflow-hidden rounded-[14px] bg-white shadow-[0_20px_50px_rgba(2,6,23,0.45)]">
            <div className="grid sm:grid-cols-2">
              <SearchField icon={Search} label="¿Qué necesitas?" value={specialty} onChange={setSpecialty}>
                <option value="all">Todas las especialidades</option>
                {specialtyCatalogue.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SearchField>

              <SearchField
                icon={MapPin}
                label="¿Dónde vives?"
                value={district}
                onChange={setDistrict}
                className="border-t border-[#E2E8F0] sm:border-l sm:border-t-0"
              >
                <option value="all">Todos los distritos</option>
                {districtCatalogue.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </SearchField>
            </div>

            <div className="border-t border-[#E2E8F0] p-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => goToDirectory(specialty, district)}
              >
                Buscar abogados
              </Button>
            </div>
          </div>

          <div className="mt-5 flex max-w-2xl flex-wrap items-center gap-2">
            <span className="text-[13px] text-white/65">En palabras simples</span>
            {quickSearches.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => goToDirectory(q.specialty, 'all')}
                className="rounded-full border border-white/30 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** One field of the search block: a label, a native select, and nothing else. */
function SearchField({
  icon: Icon,
  label,
  value,
  onChange,
  className = '',
  children,
}: {
  icon: typeof Search;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F8FAFC] focus-within:bg-[#F8FAFC] ${className}`}
    >
      <Icon className="h-5 w-5 shrink-0 text-brand" />
      <span className="min-w-0 flex-1">
        <span className="eyebrow block">{label}</span>
        <span className="relative mt-0.5 flex items-center">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-[15px] font-medium text-ink focus:outline-none"
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#475569]" />
        </span>
      </span>
    </label>
  );
}

/* -------------------------------------------------------- signature: ruta */

function Ruta() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);

  return (
    <Section
      id="como-funciona"
      tone="canvas"
      eyebrow="La ruta de tu caso"
      title={`Unos ${averageMonths} meses, cinco etapas`}
    >
      <div ref={ref}>
        {/* Horizontal rail */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-5 gap-6">
            {stages.map((s) => (
              <p key={s.month} className="eyebrow">
                {s.month}
              </p>
            ))}
          </div>

          <div className="relative mt-4 h-4">
            <span
              className={`absolute left-[9%] right-[9%] top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-gradient-to-r from-tint-border via-brand to-tint-border ${
                inView ? 'origin-left animate-rail-draw' : ''
              }`}
            />
            <div className="relative grid h-full grid-cols-5 gap-6">
              {stages.map((s, i) => (
                <span key={s.name} className="flex items-center justify-center">
                  <span
                    className={`h-4 w-4 rounded-full bg-brand ring-4 ring-canvas ${
                      inView ? 'animate-node-in' : ''
                    }`}
                    style={inView ? { animationDelay: `${350 + i * 140}ms` } : undefined}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-5 gap-6">
            {stages.map((s) => (
              <div key={s.name}>
                <h3 className="font-sans text-[15px] font-bold leading-snug text-ink">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{s.text}</p>
                <MilestoneChip milestone={s.milestone} />
              </div>
            ))}
          </div>
        </div>

        {/* Vertical rail */}
        <ol className="flex flex-col lg:hidden">
          {stages.map((s, i) => (
            <li key={s.name} className="relative flex gap-4 pb-8 last:pb-0">
              {i < stages.length - 1 && (
                <span className="absolute left-[7px] top-5 h-full w-[2px] rounded-full bg-tint-border" />
              )}
              <span className="relative mt-1.5 h-4 w-4 shrink-0 rounded-full bg-brand ring-4 ring-canvas" />
              <div>
                <p className="eyebrow">{s.month}</p>
                <h3 className="mt-1 font-sans text-[15px] font-bold text-ink">{s.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">{s.text}</p>
                <MilestoneChip milestone={s.milestone} />
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-10 max-w-xl text-sm leading-relaxed text-[#475569]">
        Los cuatro hitos cuestan entre S/ {priceFloor} y S/ {priceCeiling} cada uno y se liberan al
        cumplirse la etapa.
      </p>
    </Section>
  );
}

function MilestoneChip({ milestone }: { milestone: number | null }) {
  if (milestone === null) {
    return <p className="mt-3 text-xs text-[#94A3B8]">Sin pago en esta etapa</p>;
  }
  return (
    <span className="mt-3 inline-flex items-center rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-brand-ink">
      Hito {milestone}
    </span>
  );
}

/* ------------------------------------------------------------ por dentro */

function PorDentro() {
  return (
    <Section eyebrow="La aplicación" title="Así se ve por dentro">
      <Walkthrough />
    </Section>
  );
}

/* ---------------------------------------------------------- supervision */

function Supervision() {
  return (
    <Section tone="canvas" eyebrow="Supervisión humana" title="La IA redacta. Un abogado firma.">
      <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <ul className="flex flex-col gap-5">
          {supervisionPoints.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand" />
              <span className="font-sans text-[19px] font-bold leading-snug text-ink">{point}</span>
            </li>
          ))}
        </ul>

        <ValidationMock />
      </div>
    </Section>
  );
}

/** The validation screen, which is where the claim above is actually enforced. */
function ValidationMock() {
  return (
    <div className="rounded-card bg-white p-5 ring-1 ring-[#E2E8F0]">
      <p className="eyebrow flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5" /> Borrador de la IA
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[#334155]">
        «Se propone una pensión mensual de S/ 620 para los dos hijos, calculada como el 40 % del ingreso
        declarado del demandado.»
      </p>

      <div className="mt-4 rounded-block bg-warn-panel p-3">
        <p className="text-xs font-semibold text-warn-text">Marcado para revisión</p>
        <p className="mt-1 text-xs text-[#92400E]">Confirmar el ingreso declarado antes de enviar.</p>
      </div>

      <div className="mt-4 flex items-center gap-2" aria-hidden="true">
        <span className="rounded-[10px] bg-ink px-3.5 py-2 text-sm font-semibold text-white">Aprobar</span>
        <span className="rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-semibold text-ink">
          Corregir
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- abogados */

function Abogados() {
  return (
    <Section id="abogados-destacados" eyebrow="El directorio" title="Quién puede tomar tu caso">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredLawyers.map((l) => (
          <LawyerCard key={l.id} lawyer={l} compact profileHref={`/directorio/${l.id}`} />
        ))}
      </div>

      <Link
        to="/directorio"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline focus-visible:focus-ring"
      >
        Ver los {lawyers.length} abogados <ArrowRight className="h-4 w-4" />
      </Link>
    </Section>
  );
}

/* ---------------------------------------------------------- testimonios */

function Testimonios() {
  return (
    <Section tone="canvas" eyebrow="Reseñas" title="Lo dicen las clientas">
      <div className="grid gap-6 lg:grid-cols-3">
        {testimonials.map(({ lawyer, review }) => (
          <Card key={review.id} className="flex flex-col gap-4 ring-1 ring-[#E2E8F0]">
            <Quote className="h-6 w-6 text-brand" />
            <p className="flex-1 text-[15px] leading-relaxed text-[#334155]">«{review.text}»</p>
            <div className="border-t border-[#E2E8F0] pt-4">
              <p className="font-sans text-sm font-bold text-ink">{review.authorName}</p>
              <p className="text-xs text-[#475569]">
                {review.caseType} · con{' '}
                <Link to={`/directorio/${lawyer.id}`} className="text-link hover:underline">
                  {lawyer.name}
                </Link>
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ lawyer band */

/**
 * The one textured surface on the page: a slab of sillar, the volcanic stone
 * Arequipa and its courthouses are built from. It marks the only moment the
 * page stops talking to mothers and talks to lawyers.
 */
function LawyerBand() {
  return (
    <section className="bg-canvas pb-24">
      <div className="page-shell">
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-card px-6 py-10 ring-1 ring-black/10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <img
            src={media.bandTexture}
            alt=""
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_66%]"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-white/20" aria-hidden="true" />

          <div className="relative">
            <p className="font-sans text-[17px] font-bold text-ink">¿Eres abogado colegiado?</p>
            <p className="mt-1 text-sm text-[#334155]">Recibe casos ordenados y cobra por hitos.</p>
          </div>
          <Link to="/abogado" className="relative shrink-0">
            <Button variant="primary">Ver el panel del abogado</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ faq */

function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section title="Preguntas frecuentes">
      <div className="flex max-w-3xl flex-col gap-2">
        {faqs.map((f, i) => (
          <div key={f.q} className="overflow-hidden rounded-card bg-white ring-1 ring-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:focus-ring"
            >
              <span className="font-sans text-[15px] font-bold text-ink">{f.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[#475569] transition-transform ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && (
              <p className="border-t border-[#E2E8F0] px-5 py-4 text-sm leading-relaxed text-[#475569]">{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ final cta */

function FinalCta() {
  return (
    <section className="bg-white pb-28 pt-8">
      <div className="page-shell">
        <div className="max-w-2xl">
          <h2 className="text-balance font-serif text-[32px] font-medium leading-[1.1] text-ink sm:text-[40px]">
            Empieza por saber dónde estás parada
          </h2>
          <p className="mt-4 max-w-lg text-pretty text-[17px] leading-relaxed text-[#475569]">
            Cuenta tu situación y mira quién puede tomarla. Sin tarjeta.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/ingresar">
              <Button variant="primary" className="w-full sm:w-auto">
                Crear cuenta
              </Button>
            </Link>
            <Link to="/directorio">
              <Button variant="secondary" className="w-full sm:w-auto">
                Ver el directorio
              </Button>
            </Link>
          </div>
        </div>

        {/* The page opens on one kitchen table and closes on the city those
            cases are actually tried in. */}
        {media.cityPhoto && (
          <Plate
            className="mt-14"
            src={media.cityPhoto}
            alt="Arquería de sillar de Arequipa frente al volcán El Misti"
            imgClassName="h-[clamp(190px,26vw,330px)] w-full object-cover object-[72%_50%] sm:object-[center_18%]"
            caption={
              <>
                Arequipa, en sillar, bajo El Misti. Los {lawyers.length} abogados del directorio litigan en
                los juzgados de esta ciudad.
              </>
            }
          />
        )}
      </div>
    </section>
  );
}
