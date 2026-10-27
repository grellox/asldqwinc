import { useState } from 'react';
import { CheckCircle2, Clock, Handshake, MapPin, Store, ThumbsDown, XCircle } from 'lucide-react';
import { Card, CardBlock, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProposalModal } from '../../components/lawyers/ProposalModal';
import { useAppStore } from '../../store/useAppStore';
import type { Lead, LeadStatus } from '../../types';

const LAWYER_NAME = 'Dra. Carmen Valdivia Salas';

const resolvedMeta: Partial<Record<LeadStatus, { label: string; tone: 'success' | 'danger' | 'neutral' }>> = {
  aceptado: { label: 'Caso aceptado por la clienta', tone: 'success' },
  rechazado: { label: 'Propuesta rechazada', tone: 'danger' },
  descartado: { label: 'Descartada', tone: 'neutral' },
};

export function Leads() {
  const leads = useAppStore((s) => s.leads);
  const requests = useAppStore((s) => s.requests);
  const discardLead = useAppStore((s) => s.discardLead);
  const boardQuestions = useAppStore((s) => s.boardQuestions);
  const answerBoardQuestion = useAppStore((s) => s.answerBoardQuestion);

  const [proposingLead, setProposingLead] = useState<Lead | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const newLeads = leads.filter((l) => l.status === 'nuevo');
  const waitingLeads = leads.filter((l) => l.status === 'presupuestado');
  const resolvedLeads = leads.filter((l) => ['aceptado', 'rechazado', 'descartado'].includes(l.status));

  /** The proposal sent for a lead, when it came from the marketplace. */
  const proposalFor = (leadId: string) => requests.find((r) => r.leadId === leadId)?.proposal;

  function publishAnswer(id: string) {
    if (!draft.trim()) return;
    answerBoardQuestion(id, draft.trim(), LAWYER_NAME);
    setReplyingId(null);
    setDraft('');
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-[32px] font-medium text-ink">Adquisición</h1>
        <p className="mt-1 text-sm text-[#475569]">Nuevas solicitudes de asesoría y la pizarra pública de consultas.</p>
      </header>

      <Card>
        <CardTitle>Solicitudes nuevas</CardTitle>
        {newLeads.length === 0 ? (
          <p className="mt-3 text-sm text-[#475569]">No tienes solicitudes nuevas por ahora.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {newLeads.map((lead) => (
              <CardBlock key={lead.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{lead.motherName}</p>
                    {lead.fromMarketplace && (
                      <Badge tone="brand">
                        <Store className="h-3.5 w-3.5" /> Desde el marketplace
                      </Badge>
                    )}
                    {lead.urgency === 'alta' && <Badge tone="danger">Urgente</Badge>}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-[#475569]">
                    <MapPin className="h-3.5 w-3.5" /> {lead.district}
                    {lead.dateLabel && ` · ${lead.dateLabel}`}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-[#475569]">{lead.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="primary" size="sm" onClick={() => setProposingLead(lead)}>
                    Enviar presupuesto
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ThumbsDown className="h-3.5 w-3.5" />}
                    onClick={() => discardLead(lead.id)}
                  >
                    No puedo tomarlo
                  </Button>
                </div>
              </CardBlock>
            ))}
          </div>
        )}
      </Card>

      {waitingLeads.length > 0 && (
        <Card>
          <CardTitle>Esperando respuesta</CardTitle>
          <p className="mt-1 text-sm text-[#475569]">
            Ya enviaste tu presupuesto. La clienta decide si acepta y recién entonces se cobra el primer hito.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {waitingLeads.map((lead) => {
              const proposal = proposalFor(lead.id);
              return (
                <CardBlock key={lead.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="font-semibold text-ink">{lead.motherName}</p>
                    <Badge tone="warn">
                      <Clock className="h-3.5 w-3.5" /> Esperando respuesta
                    </Badge>
                  </div>
                  {proposal ? (
                    <p className="mt-1.5 text-sm text-[#475569]">
                      S/ {proposal.pricePerHito} × {proposal.hitos} hitos ·{' '}
                      <span className="font-semibold text-ink">
                        total S/ {proposal.pricePerHito * proposal.hitos}
                      </span>{' '}
                      · vigente hasta el {proposal.validUntil}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-sm text-[#475569]">Presupuesto enviado.</p>
                  )}
                </CardBlock>
              );
            })}
          </div>
        </Card>
      )}

      {resolvedLeads.length > 0 && (
        <Card>
          <CardTitle>Gestionadas</CardTitle>
          <div className="mt-4 flex flex-col gap-2">
            {resolvedLeads.map((lead) => {
              const meta = resolvedMeta[lead.status];
              const Icon = lead.status === 'aceptado' ? Handshake : XCircle;
              return (
                <div
                  key={lead.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-block bg-canvas px-4 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    <Icon
                      className={`h-4 w-4 ${lead.status === 'aceptado' ? 'text-brand' : 'text-[#94A3B8]'}`}
                    />
                    {lead.motherName}
                  </span>
                  {meta && <Badge tone={meta.tone}>{meta.label}</Badge>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Pizarra pública</CardTitle>
        <p className="mt-1 text-sm text-[#475569]">Responde consultas anónimas de madres que aún no tienen abogado.</p>
        <div className="mt-4 flex flex-col gap-4">
          {boardQuestions.map((q) => (
            <div key={q.id} className="rounded-block bg-canvas p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-link">{q.anonName}</p>
                <span className="text-xs text-[#475569]">{q.date}</span>
              </div>
              <p className="mt-2 font-medium text-ink">{q.question}</p>

              {q.answer ? (
                <p className="mt-3 flex items-start gap-2 text-sm text-[#334155]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {q.answer}
                </p>
              ) : replyingId === q.id ? (
                <div className="mt-3 flex flex-col gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    placeholder="Escribe tu respuesta…"
                    className="rounded-[10px] border border-[#E2E8F0] p-3 text-sm focus-visible:focus-ring"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => publishAnswer(q.id)}>
                      Publicar respuesta
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setReplyingId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => {
                    setReplyingId(q.id);
                    setDraft('');
                  }}
                >
                  Responder
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <ProposalModal
        open={proposingLead !== null}
        onClose={() => setProposingLead(null)}
        lead={proposingLead}
      />
    </div>
  );
}
