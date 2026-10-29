import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Clock, FileText, Lock, Pause, Play, Sparkles } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { media } from '../../data/media';
import { documents } from '../../data/documents';
import { suggestedQuestions } from '../../data/chat';
import { pensionByMonth } from '../../data/pension';

const SCENE_MS = 5600;

const scenes = [
  {
    id: 'expediente',
    tab: 'Tu expediente',
    caption: 'Cada papel del juzgado entra clasificado y resumido en lenguaje llano.',
    render: () => <ExpedienteScene />,
  },
  {
    id: 'asistente',
    tab: 'El asistente',
    caption: 'Preguntas en tus palabras. Responde citando la resolución de donde salió el dato.',
    render: () => <AsistenteScene />,
  },
  {
    id: 'pagos',
    tab: 'Tus pagos',
    caption: 'Qué hito está retenido, cuál se liberó y qué meses faltan por cobrar.',
    render: () => <PagosScene />,
  },
];

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Walkthrough() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [inView, setInView] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Nothing advances off screen, so the first scene is always the one you land on.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % scenes.length), SCENE_MS);
    return () => window.clearTimeout(timer);
  }, [playing, inView, active]);

  if (media.walkthroughVideo) {
    return (
      <video
        className="w-full rounded-card bg-ink shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        src={media.walkthroughVideo}
        poster={media.walkthroughPoster || undefined}
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  const scene = scenes[active];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Pantallas de Syloop">
        {scenes.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`escena-${s.id}`}
            onClick={() => {
              setActive(i);
              setPlaying(false);
            }}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:focus-ring ${
              i === active ? 'bg-ink text-white' : 'bg-white text-[#475569] ring-1 ring-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            {s.tab}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-white focus-visible:focus-ring"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? 'Pausar' : 'Reproducir'}
        </button>
      </div>

      <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-[#E2E8F0]">
        <span
          key={`${active}-${playing}`}
          className={`block h-full origin-left rounded-full bg-brand ${
            playing && inView ? 'animate-rail-draw' : ''
          }`}
          style={
            playing && inView
              ? { animationDuration: `${SCENE_MS}ms`, animationTimingFunction: 'linear' }
              : undefined
          }
        />
      </div>

      <div
        ref={stageRef}
        id={`escena-${scene.id}`}
        role="tabpanel"
        aria-live="off"
        className="mt-6 rounded-card bg-ink p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-[#475569]" />
          ))}
          <Logo showWordmark={false} variant="light" />
        </div>

        <div key={scene.id} className="animate-scene-in rounded-block bg-canvas p-4 sm:p-5">
          <div className="min-h-[300px]">{scene.render()}</div>
        </div>
      </div>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#475569]">{scene.caption}</p>
    </div>
  );
}

/* --------------------------------------------------------------- scenes */

function SceneTitle({ children }: { children: ReactNode }) {
  return <p className="font-serif text-lg font-medium text-ink">{children}</p>;
}

function ExpedienteScene() {
  return (
    <>
      <SceneTitle>Expediente 01234-2026</SceneTitle>
      <p className="mt-0.5 text-xs text-[#475569]">3.º Juzgado de Paz Letrado de Arequipa</p>

      <ul className="mt-4 flex flex-col gap-2">
        {documents.slice(0, 4).map((doc) => (
          <li key={doc.id} className="flex items-center justify-between gap-3 rounded-block bg-white p-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <FileText className="h-4 w-4 shrink-0 text-brand" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">{doc.name}</span>
                <span className="block text-xs text-[#475569]">
                  {doc.category} · {doc.date}
                </span>
              </span>
            </span>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                doc.status === 'validado' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-warn-bg text-warn-text'
              }`}
            >
              {doc.status === 'validado' ? 'Validado' : 'Pendiente'}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function AsistenteScene() {
  const item = suggestedQuestions[1];

  return (
    <>
      <SceneTitle>Asistente jurídico</SceneTitle>
      <p className="mt-0.5 text-xs text-[#475569]">Respuestas con la fuente a la vista</p>

      <div className="mt-4 flex flex-col gap-3">
        <p className="ml-auto max-w-[80%] rounded-block rounded-br-sm bg-ink px-3.5 py-2.5 text-sm text-white">
          {item.question}
        </p>

        <div className="max-w-[88%] rounded-block rounded-bl-sm bg-white p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-link">
            <Sparkles className="h-3.5 w-3.5" /> Syloop
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#334155]">{item.answers.breve}</p>
          {item.sources && (
            <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-[#E2E8F0] pt-3">
              {item.sources.map((source) => (
                <li
                  key={source}
                  className="rounded-[6px] bg-tint-soft px-2 py-1 text-xs text-brand-ink"
                >
                  {source}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function PagosScene() {
  const hitos = [
    { label: 'Demanda presentada', state: 'liberado' as const },
    { label: 'Audiencia única', state: 'custodia' as const },
    { label: 'Sentencia', state: 'pendiente' as const },
    { label: 'Ejecución', state: 'pendiente' as const },
  ];

  return (
    <>
      <SceneTitle>Pagos y pensiones</SceneTitle>
      <p className="mt-0.5 text-xs text-[#475569]">Honorarios por hitos y control de la pensión mensual</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {hitos.map((h, i) => (
          <div key={h.label} className="flex items-center justify-between gap-3 rounded-block bg-white px-3.5 py-2.5">
            <span className="flex min-w-0 items-center gap-2 text-sm text-[#334155]">
              {h.state === 'liberado' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
              ) : h.state === 'custodia' ? (
                <Lock className="h-4 w-4 shrink-0 text-brand" />
              ) : (
                <Clock className="h-4 w-4 shrink-0 text-[#94A3B8]" />
              )}
              <span className="truncate">
                {i + 1}. {h.label}
              </span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-[#475569]">
              {h.state === 'liberado' ? 'Liberado' : h.state === 'custodia' ? 'En custodia' : 'Pendiente'}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-link">Pensión mensual</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {pensionByMonth.slice(0, 3).map((m) => (
          <li key={m.month} className="flex items-center justify-between gap-3 rounded-block bg-white px-3.5 py-2">
            <span className="text-sm text-[#334155]">{m.month}</span>
            <span className="flex items-center gap-3 text-xs">
              <span className="text-[#475569]">
                S/ {m.paid} de S/ {m.due}
              </span>
              <span className={`font-semibold ${m.owed > 0 ? 'text-debt' : 'text-[#166534]'}`}>
                {m.owed > 0 ? `Debe S/ ${m.owed}` : 'Al día'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
