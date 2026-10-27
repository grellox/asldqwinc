import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { districtCatalogue, responseLabel } from '../../data/lawyers';
import { isActiveRequest, useAppStore } from '../../store/useAppStore';
import type { District, Lawyer, RequestUrgency } from '../../types';

const SUMMARY_MIN = 20;
const SUMMARY_MAX = 400;

const urgencyOptions: { value: RequestUrgency; label: string }[] = [
  { value: 'alta', label: 'Urgente · no estoy recibiendo aportes' },
  { value: 'media', label: 'Pronto · quiero avanzar este mes' },
  { value: 'baja', label: 'Sin apuro · solo quiero orientarme' },
];

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
  lawyer: Lawyer | null;
}

export function RequestModal({ open, onClose, lawyer }: RequestModalProps) {
  const sendRequest = useAppStore((s) => s.sendRequest);
  const requests = useAppStore((s) => s.requests);

  const [summary, setSummary] = useState('');
  const [district, setDistrict] = useState<District>('Cercado');
  const [urgency, setUrgency] = useState<RequestUrgency>('media');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const summaryRef = useRef<HTMLTextAreaElement>(null);

  // Each opening starts a fresh request, including after a previous one was sent.
  useEffect(() => {
    if (!open) return;
    setSummary('');
    setDistrict('Cercado');
    setUrgency('media');
    setSent(false);
    setError('');
  }, [open, lawyer?.id]);

  if (!lawyer) return null;

  const missingChars = SUMMARY_MIN - summary.trim().length;

  // The button stays active: a disabled control never says what is missing.
  function submit() {
    if (!lawyer) return;

    if (missingChars > 0) {
      setError(
        `Cuéntale un poco más del caso: faltan ${missingChars} ${
          missingChars === 1 ? 'carácter' : 'caracteres'
        }.`
      );
      summaryRef.current?.focus();
      return;
    }

    if (requests.some((r) => r.lawyerId === lawyer.id && isActiveRequest(r))) {
      setError('Ya tienes una solicitud activa con este abogado.');
      return;
    }

    sendRequest({
      lawyerId: lawyer.id,
      lawyerName: lawyer.name,
      summary: summary.trim(),
      district,
      urgency,
    });
    setSent(true);
  }

  return (
    <Modal open={open} onClose={onClose} title={sent ? 'Solicitud enviada' : 'Solicitar asesoría'}>
      {sent ? (
        <div className="flex flex-col gap-4">
          <p className="flex items-start gap-2 text-sm text-[#334155]">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            Tu solicitud llegó a la bandeja de {lawyer.name}. Suele responder en {lawyer.responseHours} h.
          </p>
          <div className="rounded-block bg-canvas p-4 text-sm text-[#475569]">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-brand" /> Todavía no pagas nada
            </p>
            <p className="mt-1.5">
              El primer hito de S/ {lawyer.pricePerHito} se cobra solo si aceptas la propuesta y queda en
              custodia hasta que se presente la demanda.
            </p>
          </div>
          <Button variant="primary" onClick={onClose}>
            Entendido
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-block bg-canvas p-4">
            <p className="font-sans text-[15px] font-bold text-ink">{lawyer.name}</p>
            <p className="mt-0.5 text-xs text-[#475569]">
              {lawyer.caaNumber} · {lawyer.district} · {lawyer.modalidad}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge tone="success">
                {lawyer.hitos} hitos de S/ {lawyer.pricePerHito}
              </Badge>
              <span className="flex items-center gap-1.5 text-xs text-[#475569]">
                <Clock className="h-3.5 w-3.5" /> {responseLabel(lawyer.responseHours)}
              </span>
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-link">Cuéntale tu caso</span>
            <textarea
              ref={summaryRef}
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value.slice(0, SUMMARY_MAX));
                setError('');
              }}
              rows={4}
              aria-invalid={error !== ''}
              placeholder="Ej.: Pensión de alimentos para mi hija de 5 años. El padre dejó de aportar hace 4 meses y trabaja de forma independiente."
              className={`rounded-[10px] border p-3 text-sm text-ink focus-visible:focus-ring ${
                error ? 'border-danger bg-danger-bg' : 'border-[#E2E8F0]'
              }`}
            />
            <span className="text-xs text-[#475569]">
              {missingChars > 0
                ? `Faltan ${missingChars} ${missingChars === 1 ? 'carácter' : 'caracteres'}`
                : `${summary.length}/${SUMMARY_MAX} caracteres`}
            </span>
          </label>

          <Select label="Tu distrito" value={district} onChange={(e) => setDistrict(e.target.value as District)}>
            {districtCatalogue.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>

          <Select
            label="¿Qué tan urgente es?"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
          >
            {urgencyOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>

          <p className="text-xs text-[#475569]">
            No compartas datos de terceros que no quieras revelar todavía. Enviar la solicitud no te compromete a
            contratar.
          </p>

          {error && (
            <p role="alert" className="rounded-block bg-danger-bg px-3 py-2 text-sm text-danger-text">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="primary" className="flex-1" onClick={submit}>
              Enviar solicitud
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
