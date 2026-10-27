import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarClock, Users2, Milestone, Crown, CheckCircle2, AlertTriangle, Video } from 'lucide-react';
import { Card, CardBlock, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Toggle } from '../../components/ui/Toggle';
import { Badge } from '../../components/ui/Badge';
import { ThinBars } from '../../components/charts/ThinBars';
import { GroupedBars } from '../../components/charts/GroupedBars';
import { HBars } from '../../components/charts/HBars';
import {
  custodyByMonth,
  custodyFullYear2026,
  casesByStage,
  activeCases,
  activeCasesCount,
  caseMilestones,
  aiAlerts,
  videoShowcase,
  lawyerReputation,
  subscriptionPlans,
} from '../../data/lawyerDesk';
import { MY_LAWYER_ID } from '../../data/lawyers';
import { useAppStore } from '../../store/useAppStore';
import type { MilestoneStatus } from '../../types';

const milestoneStyles: Record<MilestoneStatus, { label: string; className: string }> = {
  liberado: { label: 'Liberado', className: 'bg-ink text-white' },
  verificando: { label: 'Verificando', className: 'bg-brand-ink text-white' },
  custodia: { label: 'En custodia', className: 'bg-[#E2E8F0] text-[#475569]' },
};

export function CommandCenter() {
  const navigate = useNavigate();
  const [showPeers, setShowPeers] = useState(true);
  const [range, setRange] = useState<'6m' | '2026'>('6m');

  const custody = range === '6m' ? custodyByMonth : custodyFullYear2026;

  // A case contracted from the marketplace joins the desk alongside the seeded ones.
  const engagement = useAppStore((s) => s.engagement);
  const requests = useAppStore((s) => s.requests);
  const mine = engagement?.lawyerId === MY_LAWYER_ID ? engagement : null;
  const engagementRequest = mine ? (requests.find((r) => r.id === mine.requestId) ?? null) : null;

  const cases =
    mine && engagementRequest
      ? [
          {
            id: mine.caseId,
            clientName: engagementRequest.motherName,
            stage: 'Encargo aceptado',
            district: engagementRequest.district,
          },
          ...activeCases,
        ]
      : activeCases;

  const milestones =
    mine && engagementRequest
      ? [
          {
            caseId: mine.caseId,
            clientName: engagementRequest.motherName,
            status: 'custodia' as const,
            amount: mine.pricePerHito,
          },
          ...caseMilestones,
        ]
      : caseMilestones;

  const inCustody = custodyByMonth[custodyByMonth.length - 1].value + (mine?.pricePerHito ?? 0);
  const upcoming = cases.filter((c) => c.nextHearing);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-serif text-[32px] font-medium text-ink">Centro de mando</h1>
          <p className="mt-1 text-sm text-[#475569]">Dra. Carmen Valdivia Salas · CAA N.º 4521</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 text-sm font-medium text-[#475569]">
            <Toggle checked={showPeers} onChange={setShowPeers} label="Mostrar comparación con pares" />
            <button type="button" onClick={() => setShowPeers((v) => !v)} className="font-medium">
              Pares
            </button>
          </div>
          <span className="rounded-full bg-tint px-3.5 py-1.5 text-sm font-semibold text-brand-ink">
            En custodia: S/ {inCustody.toLocaleString('es-PE')}
          </span>
          <Button variant="primary" onClick={() => navigate('/abogado/asistente')}>
            Preguntar a Syloop
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <CardTitle>Custodia</CardTitle>
            <Select aria-label="Rango de custodia" value={range} onChange={(e) => setRange(e.target.value as '6m' | '2026')} className="!min-h-[38px] text-sm">
              <option value="6m">6 meses</option>
              <option value="2026">2026</option>
            </Select>
          </div>
          <div className="mt-4">
            <ThinBars
              data={custody.map((c) => c.value)}
              overlay={showPeers ? custody.map((c) => c.peer) : undefined}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-[#475569]">
            {custody.map((c) => (
              <span key={c.month}>{c.month}</span>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Casos por etapa</CardTitle>
          <div className="mt-4">
            <GroupedBars
              categories={casesByStage.map((c) => c.stage)}
              series={
                showPeers
                  ? [
                      { label: 'Mis casos', color: '#4A8CF0' },
                      { label: 'Pares', color: '#CBD5E1' },
                      { label: 'Subsanación', color: '#F59E0B' },
                    ]
                  : [
                      { label: 'Mis casos', color: '#4A8CF0' },
                      { label: 'Subsanación', color: '#F59E0B' },
                    ]
              }
              values={
                showPeers
                  ? [casesByStage.map((c) => c.mine), casesByStage.map((c) => c.peer), casesByStage.map((c) => c.subsanacion)]
                  : [casesByStage.map((c) => c.mine), casesByStage.map((c) => c.subsanacion)]
              }
            />
          </div>
        </Card>

        <Card className="flex flex-col items-start gap-2">
          <CardTitle>Casos activos</CardTitle>
          <p className="font-serif text-5xl font-medium text-ink">{activeCasesCount + (mine ? 1 : 0)}</p>
          <p className="text-sm text-[#475569]">Distribuidos en los 6 distritos de Arequipa.</p>
        </Card>

        <Card>
          <CardTitle>Clientas más activas</CardTitle>
          <ul className="mt-4 flex flex-col gap-2">
            {cases.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  to={`/abogado/clienta/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-block bg-canvas px-3 py-2.5 text-sm hover:bg-tint-soft"
                >
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <Users2 className="h-4 w-4 text-brand" /> {c.clientName}
                  </span>
                  <span className="text-xs text-[#475569]">{c.stage}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>Próximas audiencias</CardTitle>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-[#475569]">No tienes audiencias programadas por ahora.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {upcoming.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-block bg-canvas px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <CalendarClock className="h-4 w-4 text-brand" /> {c.clientName}
                  </span>
                  <span className="text-xs font-semibold text-brand-ink">{c.nextHearing}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <PlanCard />
        <AlertsCard />

        <Card className="lg:col-span-2">
          <CardTitle>Hitos por caso</CardTitle>
          <p className="mt-1 text-sm text-[#475569]">
            Los documentos probatorios de cada hito quedan respaldados en la bóveda digital de Syloop.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {milestones.map((m) => (
              <CardBlock key={m.caseId} className="flex items-center justify-between gap-3">
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <Milestone className="h-3.5 w-3.5 text-brand" /> {m.clientName}
                  </span>
                  <span className="text-xs text-[#475569]">S/ {m.amount}</span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${milestoneStyles[m.status].className}`}>
                  {milestoneStyles[m.status].label}
                </span>
              </CardBlock>
            ))}
          </div>
        </Card>

        <VitrineCard />
      </div>
    </div>
  );
}

function PlanCard() {
  const [planId, setPlanId] = useState<'pro' | 'enterprise'>('pro');
  const plan = subscriptionPlans.find((p) => p.id === planId)!;
  const other = subscriptionPlans.find((p) => p.id !== planId)!;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle>Tu plan</CardTitle>
          <p className="mt-1 text-sm text-[#475569]">Suscripción mensual de Syloop</p>
        </div>
        <Badge tone="brand">
          <Crown className="h-3.5 w-3.5" /> {plan.name}
        </Badge>
      </div>
      <p className="mt-3 font-serif text-3xl font-medium text-ink">
        S/ {plan.price}
        <span className="font-sans text-sm font-normal text-[#475569]">/mes</span>
      </p>
      <ul className="mt-3 flex flex-col gap-1.5 text-sm text-[#475569]">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            {f}
          </li>
        ))}
      </ul>
      <Button variant="secondary" className="mt-4 w-full" onClick={() => setPlanId(other.id)}>
        {planId === 'pro'
          ? `Mejorar a ${other.name} (S/ ${other.price}/mes)`
          : `Volver a ${other.name} (S/ ${other.price}/mes)`}
      </Button>
    </Card>
  );
}

function AlertsCard() {
  const [alerts, setAlerts] = useState(aiAlerts);

  function dismiss(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <CardTitle>Alertas de la IA</CardTitle>
        <Badge tone={alerts.length > 0 ? 'warn' : 'success'}>{alerts.length}</Badge>
      </div>
      <p className="mt-1 text-sm text-[#475569]">Plazos y omisiones detectadas, pendientes de tu revisión.</p>
      {alerts.length === 0 ? (
        <p className="mt-4 text-sm text-[#475569]">No tienes alertas pendientes. Buen trabajo.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-start justify-between gap-3 rounded-block p-3 ${
                a.severity === 'urgente' ? 'bg-warn-panel' : 'bg-canvas'
              }`}
            >
              <div className="flex gap-2.5">
                <AlertTriangle
                  className={`mt-0.5 h-4 w-4 shrink-0 ${a.severity === 'urgente' ? 'text-warn-text' : 'text-brand'}`}
                />
                <div>
                  <p className="text-sm font-semibold text-ink">{a.clientName}</p>
                  <p className="text-xs text-[#475569]">{a.text}</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => dismiss(a.id)}>
                Revisado
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function VitrineCard() {
  const [notice, setNotice] = useState('');

  function handleUpload() {
    setNotice('Tu video se publicará en la vitrina en unos minutos (demo).');
    setTimeout(() => setNotice(''), 2500);
  }

  return (
    <Card>
      <CardTitle>Vitrina y reputación</CardTitle>
      <p className="mt-1 text-sm text-[#475569]">Tus videos educativos atraen clientas de forma orgánica.</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <CardBlock>
          <p className="font-serif text-2xl font-medium text-ink">{videoShowcase.videosPublished}</p>
          <p className="mt-1 text-xs text-[#475569]">videos publicados</p>
        </CardBlock>
        <CardBlock>
          <p className="font-serif text-2xl font-medium text-ink">{videoShowcase.totalViews.toLocaleString('es-PE')}</p>
          <p className="mt-1 text-xs text-[#475569]">vistas totales</p>
        </CardBlock>
        <CardBlock>
          <p className="font-serif text-2xl font-medium text-brand-ink">{videoShowcase.leadsGenerated}</p>
          <p className="mt-1 text-xs text-[#475569]">leads generados</p>
        </CardBlock>
      </div>
      <div className="mt-4">
        <HBars
          data={lawyerReputation.map((r) => ({ label: r.label, value: r.value.toFixed(1) }))}
          values={lawyerReputation.map((r) => r.value)}
        />
      </div>
      <Button
        variant="secondary"
        className="mt-4 w-full"
        icon={<Video className="h-4 w-4 text-brand" />}
        onClick={handleUpload}
      >
        Subir nuevo video
      </Button>
      {notice && <p className="mt-2 text-sm font-medium text-brand-ink">{notice}</p>}
    </Card>
  );
}
