import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, Handshake, Lock, Send, ShieldCheck, Trash2, Wallet, XCircle } from 'lucide-react';
import { Card, CardBlock, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import type { AdviceRequest, RequestStatus, RequestUrgency } from '../../types';

const urgencyLabel: Record<RequestUrgency, string> = {
  alta: 'Urgente',
  media: 'Este mes',
  baja: 'Orientación',
};

const statusMeta: Record<
  RequestStatus,
  { label: string; tone: 'neutral' | 'brand' | 'success' | 'warn' | 'danger' }
> = {
  enviada: { label: 'Enviada · esperando respuesta', tone: 'neutral' },
  propuesta: { label: 'Te envió un presupuesto', tone: 'brand' },
  aceptada: { label: 'Caso contratado', tone: 'success' },
  rechazada: { label: 'Rechazaste la propuesta', tone: 'neutral' },
  descartada: { label: 'No puede tomar tu caso', tone: 'warn' },
};

export function MyRequests() {
  const requests = useAppStore((s) => s.requests);
  const engagement = useAppStore((s) => s.engagement);
  const cancelRequest = useAppStore((s) => s.cancelRequest);
  const acceptProposal = useAppStore((s) => s.acceptProposal);
  const declineProposal = useAppStore((s) => s.declineProposal);

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const confirming = requests.find((r) => r.id === confirmingId) ?? null;

  if (requests.length === 0 && !engagement) return null;

  return (
    <div className="flex flex-col gap-4">
      {engagement && (
        <Card className="border border-tint-border bg-tint-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Tu caso con {engagement.lawyerName}</CardTitle>
              <p className="mt-1 text-sm text-[#475569]">
                Expediente interno {engagement.caseId} · iniciado el {engagement.startedAt}
              </p>
            </div>
            <Badge tone="success">
              <Handshake className="h-3.5 w-3.5" /> Caso contratado
            </Badge>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {engagement.milestones.map((m, i) => (
              <div
                key={m.label}
                className="flex items-center justify-between gap-3 rounded-block bg-white px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm text-[#334155]">
                  {m.status === 'custodia' ? (
                    <Lock className="h-4 w-4 shrink-0 text-brand" />
                  ) : (
                    <Clock className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                  )}
                  <span className="truncate">
                    {i + 1}. {m.label}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-sans text-sm font-bold text-ink">S/ {m.amount}</span>
                  <span className="block text-xs text-[#475569]">
                    {m.status === 'custodia' ? 'En custodia' : 'Pendiente'}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-[#475569]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            El primer hito quedó retenido por Syloop. Se libera cuando la demanda esté presentada y tú lo
            confirmes; los demás se cobran recién al llegar a cada etapa.
          </p>
        </Card>
      )}

      {requests.length > 0 && (
        <Card>
          <CardTitle>Mis solicitudes</CardTitle>
          <p className="mt-1 text-sm text-[#475569]">
            {requests.length === 1 ? 'Enviaste 1 solicitud' : `Enviaste ${requests.length} solicitudes`}. Puedes
            consultar con varios abogados antes de decidir.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {requests.map((r) => (
              <RequestRow
                key={r.id}
                request={r}
                onCancel={() => cancelRequest(r.id)}
                onAccept={() => setConfirmingId(r.id)}
                onDecline={() => declineProposal(r.id)}
              />
            ))}
          </div>

          <p className="mt-4 flex items-center gap-2 text-xs text-[#475569]">
            <Send className="h-3.5 w-3.5" /> No se cobra nada hasta que aceptes un presupuesto.
          </p>
        </Card>
      )}

      <Modal open={confirming !== null} onClose={() => setConfirmingId(null)} title="Confirmar contratación">
        {confirming?.proposal && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#334155]">
              Vas a contratar a <span className="font-semibold text-ink">{confirming.lawyerName}</span> por{' '}
              <span className="font-semibold text-ink">
                S/ {confirming.proposal.pricePerHito} × {confirming.proposal.hitos} hitos
              </span>
              .
            </p>

            <CardBlock>
              <p className="flex items-center justify-between text-sm">
                <span className="text-[#475569]">Se retiene ahora (primer hito)</span>
                <span className="font-sans font-bold text-ink">S/ {confirming.proposal.pricePerHito}</span>
              </p>
              <p className="mt-2 flex items-center justify-between text-sm">
                <span className="text-[#475569]">Resto, al cumplirse cada etapa</span>
                <span className="font-sans font-bold text-ink">
                  S/ {confirming.proposal.pricePerHito * (confirming.proposal.hitos - 1)}
                </span>
              </p>
            </CardBlock>

            <p className="text-xs text-[#475569]">
              El dinero del primer hito queda en custodia de Syloop, no pasa al abogado hasta que la demanda
              esté presentada y tú lo confirmes.
            </p>

            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  acceptProposal(confirming.id);
                  setConfirmingId(null);
                }}
              >
                Confirmar y empezar
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingId(null)}>
                Volver
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

interface RequestRowProps {
  request: AdviceRequest;
  onCancel: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

function RequestRow({ request: r, onCancel, onAccept, onDecline }: RequestRowProps) {
  const meta = statusMeta[r.status];

  return (
    <CardBlock>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link
            to={`/madre/abogados/${r.lawyerId}`}
            className="font-sans text-[15px] font-bold text-ink hover:underline"
          >
            {r.lawyerName}
          </Link>
          <p className="mt-0.5 text-xs text-[#475569]">
            {r.dateLabel} · {r.district} · {urgencyLabel[r.urgency]}
          </p>
        </div>
        <Badge tone={meta.tone}>
          {r.status === 'aceptada' && <Handshake className="h-3.5 w-3.5" />}
          {r.status === 'propuesta' && <Wallet className="h-3.5 w-3.5" />}
          {r.status === 'enviada' && <Clock className="h-3.5 w-3.5" />}
          {(r.status === 'rechazada' || r.status === 'descartada') && <XCircle className="h-3.5 w-3.5" />}
          {meta.label}
        </Badge>
      </div>

      <p className="mt-2 text-sm text-[#475569]">{r.summary}</p>

      {r.status === 'propuesta' && r.proposal && (
        <div className="mt-3 rounded-block border border-tint-border bg-tint-soft p-4">
          <p className="flex items-center gap-2 font-sans text-sm font-bold text-ink">
            <FileText className="h-4 w-4 text-brand" /> Presupuesto
          </p>
          <p className="mt-1.5 text-sm text-[#334155]">
            S/ {r.proposal.pricePerHito} por hito × {r.proposal.hitos} hitos ·{' '}
            <span className="font-semibold text-ink">
              total S/ {r.proposal.pricePerHito * r.proposal.hitos}
            </span>
          </p>
          <p className="mt-2 border-l-2 border-tint-border pl-3 text-sm text-[#475569]">{r.proposal.message}</p>
          <p className="mt-2 text-xs text-[#475569]">
            Vigente hasta el {r.proposal.validUntil}. Pagas S/ {r.proposal.pricePerHito} ahora; el resto, cuando
            cada etapa se cumpla.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" size="sm" onClick={onAccept}>
              Aceptar y empezar
            </Button>
            <Button variant="secondary" size="sm" onClick={onDecline}>
              Rechazar
            </Button>
          </div>
        </div>
      )}

      {r.status === 'descartada' && (
        <p className="mt-2 text-xs text-[#475569]">
          Puedes enviar tu caso a otro abogado del marketplace sin volver a escribirlo.
        </p>
      )}

      {r.status === 'enviada' && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 !px-2 text-[#475569]"
          icon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={onCancel}
        >
          Retirar solicitud
        </Button>
      )}
    </CardBlock>
  );
}
