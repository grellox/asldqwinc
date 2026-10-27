import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Coins,
  RefreshCw,
  MessageSquareText,
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  Clock3,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ThinBars } from '../../components/charts/ThinBars';
import { GroupedBars } from '../../components/charts/GroupedBars';
import { LawyerCard } from '../../components/cards/LawyerCard';
import { ArequipaCollage } from '../../components/landing/ArequipaCollage';
import { VolcanoSilhouette } from '../../components/ui/VolcanoSilhouette';
import { Logo } from '../../components/ui/Logo';
import { featuredLawyers } from '../../data/lawyers';
import { progressBars } from '../../data/progress';
import { pensionByMonth } from '../../data/pension';
import { useAppStore } from '../../store/useAppStore';

const guarantees = [
  { icon: ShieldCheck, title: 'Supervisión humana', text: 'Un abogado revisa cada documento y cada respuesta de la IA.' },
  { icon: Coins, title: 'Pago por hitos', text: 'Pagas en partes según avanza tu caso, nunca todo por adelantado.' },
  { icon: RefreshCw, title: 'Conectado al CEJ', text: 'Tu expediente se actualiza con el Poder Judicial automáticamente.' },
  { icon: MessageSquareText, title: 'En lenguaje claro', text: 'Explicaciones sin tecnicismos, pensadas para que entiendas todo.' },
];

const stepsByAudience: Record<'madre' | 'abogado', { title: string; description: string; to: string }[]> = {
  madre: [
    { title: 'Cuenta tu caso', description: 'Respondes preguntas simples y la IA organiza tu expediente inicial.', to: '/ingresar' },
    { title: 'Conecta con un abogado', description: 'Eliges un abogado verificado del CAA según tu zona y presupuesto.', to: '/directorio' },
    { title: 'Sigue tu proceso', description: 'Tu expediente se sincroniza con el CEJ y ves cada avance al instante.', to: '/madre/ruta' },
    { title: 'Resuelve con ayuda de la IA', description: 'El asistente te explica cada paso y prepara documentos, siempre revisados por tu abogado.', to: '/madre/asistente' },
    { title: 'Cobra tu pensión', description: 'Verificas los pagos y preparas la liquidación si hay atrasos.', to: '/madre/gastos' },
  ],
  abogado: [
    { title: 'Recibe clientas verificadas', description: 'Nuevas madres te contactan según tu especialidad y distrito.', to: '/abogado/adquisicion' },
    { title: 'Revisa el caso con IA', description: 'La IA prepara un resumen y documentos base para que tú los valides.', to: '/abogado/validacion' },
    { title: 'Atiende por hitos', description: 'Cobras en 4 pagos conforme avanza el caso, sin gestionar cobranzas.', to: '/abogado' },
    { title: 'Valida cada entrega', description: 'Apruebas, corriges o rechazas lo que genera la IA antes de enviarlo.', to: '/abogado/validacion' },
    { title: 'Compara tu desempeño', description: 'Ves tus tiempos frente al promedio de otros abogados de la plataforma.', to: '/abogado' },
  ],
};

const supervisionLayers = [
  { n: '01', title: 'Expediente', text: 'Cada documento se organiza y clasifica automáticamente, listo para revisión humana.' },
  { n: '02', title: 'Asistente IA', text: 'Responde con estilos claros, pero marca lo que no puede resolver sola.' },
  { n: '03', title: 'Revisión del abogado', text: 'Ningún texto generado por IA sale sin que tu abogado lo apruebe.' },
  { n: '04', title: 'CEJ', text: 'La sincronización con el Poder Judicial evita que se te pase una fecha.' },
  { n: '05', title: 'Pago por hitos', text: 'El dinero queda en custodia y se libera solo cuando se cumple cada etapa.' },
  { n: '06', title: 'Control de pensiones', text: 'Cada depósito se verifica contra tu calendario de pagos, mes a mes.' },
];

export function Landing() {
  return (
    <>
      <Hero />
      <GuaranteeStrip />
      <HowItWorks />
      <MadeForArequipa />
      <OpenBoard />
      <Supervision />
      <FeaturedLawyers />
      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(60% 50% at 50% 0%, #DCE9FD 0%, #EEF4FE 45%, #FFFFFF 80%)',
        }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(#BFD7FB 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(60% 60% at 50% 30%, black 40%, transparent 100%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-28 opacity-70">
        <VolcanoSilhouette variant="light" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
        <span className="inline-flex items-center rounded-full border border-tint-border bg-white/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-link">
          IA con supervisión humana · Arequipa
        </span>

        <h1 className="mt-6 font-serif text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
          Devolvemos el tiempo <span className="text-link">a la justicia</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-[17px] text-[#475569]">
          Syloop organiza tu expediente, te conecta con un abogado verificado del Colegio de Abogados de Arequipa y
          usa inteligencia artificial —siempre revisada por personas— para explicarte cada paso de tu proceso de
          alimentos, sin tecnicismos y sin perder tiempo.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/ingresar">
            <Button variant="primary">Comenzar mi caso gratis</Button>
          </Link>
          <Link to="/directorio">
            <Button variant="secondary">Explorar abogados</Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-[#475569]">Gratis para empezar · Abogados verificados por el CAA</p>

        <div className="relative mx-auto mt-14 hidden max-w-3xl xl:block">
          <FloatingCard className="-left-20 top-6 rotate-[-4deg]">
            <span className="flex items-center gap-2 text-sm font-semibold text-ink">
              <FileText className="h-4 w-4 text-brand" /> Demanda admitida
            </span>
            <span className="text-xs text-[#475569]">3° JPL de Arequipa</span>
          </FloatingCard>
          <FloatingCard className="-right-24 top-0 rotate-[3deg]">
            <span className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-brand" /> Asistente Syloop
            </span>
            <span className="text-xs text-[#475569]">“Tu audiencia es el 10 de noviembre.”</span>
          </FloatingCard>
          <FloatingCard className="-left-16 bottom-0 rotate-[2deg]">
            <span className="text-sm font-semibold text-ink">S/ 225 en custodia</span>
            <span className="text-xs text-[#475569]">hito 2 de 4</span>
            <span className="mt-1.5 flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={`h-1.5 w-7 rounded-full ${i <= 2 ? 'bg-brand' : 'bg-[#E2E8F0]'}`} />
              ))}
            </span>
          </FloatingCard>
          <FloatingCard className="-right-20 bottom-4 rotate-[-2deg]">
            <span className="flex items-center gap-2 text-sm font-semibold text-ink">
              <CheckCircle2 className="h-4 w-4 text-brand" /> Dra. Valdivia revisó tu resumen
            </span>
          </FloatingCard>

          <ProductPreview />
        </div>

        <div className="mx-auto mt-10 max-w-3xl xl:hidden">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute z-10 flex w-44 flex-col gap-0.5 rounded-card bg-white p-3.5 text-left shadow-xl ${className}`}>
      {children}
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative z-0 overflow-hidden rounded-2xl border-4 border-ink bg-ink shadow-2xl">
      <div className="flex items-center gap-1.5 bg-ink px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#475569]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#475569]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#475569]" />
      </div>
      <div className="flex bg-canvas">
        <div className="hidden w-16 flex-col items-center gap-3 bg-ink py-4 sm:flex">
          <Logo showWordmark={false} variant="light" />
        </div>
        <div className="flex-1 p-4 text-left">
          <p className="font-serif text-sm font-medium text-ink">Hola, María. Vamos paso a paso</p>
          <Card className="mt-3 !p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-link">Avance del proceso</p>
            <p className="font-serif text-2xl font-medium text-ink">42%</p>
            <ThinBars data={progressBars.slice(-40)} height={48} />
          </Card>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Card className="!p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-link">Pensión</p>
              <p className="mt-1 text-xs text-[#475569]">por mes</p>
              <GroupedBars
                categories={pensionByMonth.slice(0, 3).map((m) => m.month)}
                series={[{ label: 'Pagado', color: '#4A8CF0' }]}
                values={[pensionByMonth.slice(0, 3).map((m) => m.paid)]}
                height={48}
              />
            </Card>
            <Card className="!p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-link">¿Qué sigue?</p>
              <p className="mt-1 text-xs text-[#475569]">Subir constancia de ingresos</p>
              <span className="mt-2 inline-block rounded-[8px] bg-ink px-2 py-1 text-[11px] font-semibold text-white">
                Subir
              </span>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuaranteeStrip() {
  return (
    <section className="border-y border-[#E2E8F0] bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
        {guarantees.map((g) => (
          <div key={g.title} className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tint text-brand-ink">
              <g.icon className="h-5 w-5" />
            </span>
            <p className="text-sm font-bold text-ink">{g.title}</p>
            <p className="text-xs text-[#475569]">{g.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const [audience, setAudience] = useState<'madre' | 'abogado'>('madre');
  const [activeStep, setActiveStep] = useState(0);
  const steps = stepsByAudience[audience];

  return (
    <section id="como-funciona" className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
          Una sola plataforma para <span className="text-link">todo tu proceso de alimentos</span>
        </h2>

        <div className="mx-auto mt-6 inline-flex rounded-full bg-[#F1F5F9] p-1" role="tablist">
          <button
            role="tab"
            aria-selected={audience === 'madre'}
            onClick={() => {
              setAudience('madre');
              setActiveStep(0);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${audience === 'madre' ? 'bg-white text-ink shadow-sm' : 'text-[#475569]'}`}
          >
            Para madres
          </button>
          <button
            role="tab"
            aria-selected={audience === 'abogado'}
            onClick={() => {
              setAudience('abogado');
              setActiveStep(0);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${audience === 'abogado' ? 'bg-white text-ink shadow-sm' : 'text-[#475569]'}`}
          >
            Para abogados
          </button>
        </div>

        <div className="mt-10 flex flex-wrap items-stretch justify-center gap-2">
          {steps.map((step, i) => (
            <button
              key={step.title}
              onClick={() => setActiveStep(i)}
              className={`relative flex min-h-[44px] items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors ${
                activeStep === i ? 'bg-ink text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${activeStep === i ? 'bg-white/20' : 'bg-white'}`}>
                {i + 1}
              </span>
              {step.title}
              {i < steps.length - 1 && <ArrowRight className="ml-1 hidden h-3.5 w-3.5 opacity-40 sm:block" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-card bg-ink">
        <div className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">
          Plataforma Syloop · IA + supervisión humana obligatoria
        </div>
        <div className="border-t border-sidebar-hover bg-canvas p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-link">Paso {activeStep + 1}</p>
          <h3 className="mt-1 font-serif text-2xl font-medium text-ink">{steps[activeStep].title}</h3>
          <p className="mt-2 text-[#475569]">{steps[activeStep].description}</p>
          <Link to={steps[activeStep].to} className="mt-5 inline-block">
            <Button variant="primary">Ver pantalla relacionada</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function MadeForArequipa() {
  return (
    <section className="bg-canvas px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <ArequipaCollage />

        <div>
          <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
            Del juzgado <span className="text-link">a tu celular</span>
          </h2>
          <ul className="mt-6 flex flex-col gap-3 text-[#475569]">
            <li className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              Pensado para los juzgados de paz letrado de Arequipa, no para un modelo genérico.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              Trabaja con abogados verificados por el Colegio de Abogados de Arequipa.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              Disponible en español y quechua, con abogados que atienden en ambos idiomas.
            </li>
          </ul>
          <Link to="/ingresar" className="mt-6 inline-block">
            <Button variant="primary">Comenzar mi caso</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function OpenBoard() {
  const boardQuestions = useAppStore((s) => s.boardQuestions);
  const addBoardQuestion = useAppStore((s) => s.addBoardQuestion);
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    addBoardQuestion(draft.trim());
    setDraft('');
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  }

  return (
    <section id="pizarra" className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">Pizarra de consultas abiertas</h2>
          <p className="mt-2 text-[#475569]">
            Publica una pregunta anónima sobre pensión de alimentos y abogados verificados pueden responderte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe tu pregunta de forma anónima…"
            className="min-h-[44px] flex-1 rounded-[10px] border border-[#E2E8F0] px-3.5 text-[15px] focus-visible:focus-ring"
          />
          <Button type="submit" variant="primary">
            Publicar
          </Button>
        </form>
        {sent && <p className="mt-2 text-center text-sm font-medium text-brand-ink">Tu pregunta fue publicada.</p>}

        <div className="mt-10 flex flex-col gap-4">
          {boardQuestions.map((q) => (
            <Card key={q.id} className="text-left">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-link">{q.anonName}</p>
                <span className="text-xs text-[#475569]">{q.date}</span>
              </div>
              <p className="mt-2 font-medium text-ink">{q.question}</p>
              {q.answer ? (
                <div className="mt-3 rounded-block bg-tint-soft p-4">
                  <p className="text-sm text-[#334155]">{q.answer}</p>
                  <p className="mt-2 text-xs font-semibold text-brand-ink">— {q.lawyerName}, abogado(a) verificado(a)</p>
                </div>
              ) : (
                <p className="mt-3 text-sm italic text-[#475569]">Esperando respuesta…</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Supervision() {
  return (
    <section className="bg-ink px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-serif text-3xl font-medium text-white sm:text-4xl">
          Supervisión humana en cada capa
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {supervisionLayers.map((l) => (
            <div key={l.n} className="flex gap-4">
              <span className="font-serif text-2xl font-medium text-sky">{l.n}</span>
              <div>
                <p className="font-sans text-[15px] font-bold text-white">{l.title}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">{l.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedLawyers() {
  return (
    <section id="abogados-destacados" className="bg-canvas px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">Abogados destacados</h2>
          <Link to="/directorio" className="hidden text-sm font-semibold text-link hover:underline sm:block">
            Ver marketplace completo
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredLawyers.map((l) => (
            <LawyerCard key={l.id} lawyer={l} compact profileHref={`/directorio/${l.id}`} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/directorio" className="text-sm font-semibold text-link hover:underline">
            Ver marketplace completo
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink px-4 py-24 text-center sm:px-6">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(60% 50% at 50% 0%, #27364D 0%, #1E293B 60%)' }}
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 opacity-70">
        <VolcanoSilhouette variant="dark" />
      </div>
      <Clock3 className="mx-auto h-8 w-8 text-sky" />
      <h2 className="mt-4 font-serif text-3xl font-medium text-white sm:text-4xl">
        ¿Lista para dar el primer paso?
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-[#CBD5E1]">
        Empieza hoy, organiza tu expediente y conecta con un abogado verificado del CAA.
      </p>
      <Link to="/ingresar" className="mt-7 inline-block">
        <Button variant="sky">Comenzar mi caso gratis</Button>
      </Link>
    </section>
  );
}
