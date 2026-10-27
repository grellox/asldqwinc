import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useAppStore } from '../../store/useAppStore';
import type { Lead } from '../../types';

const MESSAGE_MIN = 20;
const MESSAGE_MAX = 400;
const validityOptions = [3, 5, 7];

interface ProposalModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export function ProposalModal({ open, onClose, lead }: ProposalModalProps) {
  const sendProposal = useAppStore((s) => s.sendProposal);
  const lawyerProfile = useAppStore((s) => s.lawyerProfile);

  const [pricePerHito, setPricePerHito] = useState(lawyerProfile.pricePerHito);
  const [hitos, setHitos] = useState(4);
  const [message, setMessage] = useState('');
  const [validDays, setValidDays] = useState(5);
  const [error, setError] = useState('');
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setPricePerHito(lawyerProfile.pricePerHito);
    setHitos(4);
    setValidDays(5);
    setError('');
    setMessage(
      lead
        ? `Hola ${lead.motherName.split(' ')[0]}, revisé tu caso y puedo acompañarte. Te propongo trabajar por hitos: pagas cada etapa solo cuando se cumple.`
        : ''
    );
  }, [open, lead, lawyerProfile.pricePerHito]);

  if (!lead) return null;

  const total = pricePerHito * hitos;
  const missingChars = MESSAGE_MIN - message.trim().length;

  // The button stays active: a disabled control never says what is missing.
  function submit() {
    if (!lead) return;

    if (!Number.isFinite(pricePerHito) || pricePerHito < 50 || pricePerHito > 1000) {
      setError('El precio por hito debe estar entre S/ 50 y S/ 1000.');
      return;
    }

    if (missingChars > 0) {
      setError(
        `Escribe un mensaje para la clienta: faltan ${missingChars} ${
          missingChars === 1 ? 'carácter' : 'caracteres'
        }.`
      );
      messageRef.current?.focus();
      return;
    }

    const validUntil = new Date(Date.now() + validDays * 86400000).toLocaleDateString('es-PE');
    sendProposal(lead.id, { pricePerHito, hitos, message: message.trim(), validUntil });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Enviar presupuesto">
      <div className="flex flex-col gap-4">
        <div className="rounded-block bg-canvas p-4">
          <p className="font-sans text-[15px] font-bold text-ink">{lead.motherName}</p>
          <p className="mt-0.5 text-xs text-[#475569]">
            {lead.district}
            {lead.dateLabel && ` · ${lead.dateLabel}`}
          </p>
          <p className="mt-2 text-sm text-[#475569]">{lead.summary}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-link">Precio por hito</span>
            <span className="relative inline-flex items-center">
              <span className="pointer-events-none absolute left-3.5 text-sm text-[#475569]">S/</span>
              <input
                type="number"
                min={50}
                max={1000}
                step={5}
                value={pricePerHito}
                onChange={(e) => {
                  setPricePerHito(Number(e.target.value));
                  setError('');
                }}
                className="min-h-[44px] w-full rounded-[10px] border border-[#E2E8F0] bg-white pl-9 pr-3 text-[15px] text-ink focus-visible:focus-ring"
              />
            </span>
          </label>

          <Select label="Número de hitos" value={hitos} onChange={(e) => setHitos(Number(e.target.value))}>
            {[3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} hitos
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-block bg-tint-soft px-4 py-3">
          <span className="text-sm text-[#475569]">Total del encargo</span>
          <span className="font-sans text-[17px] font-bold text-ink">S/ {total}</span>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-link">Mensaje para la madre</span>
          <textarea
            ref={messageRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value.slice(0, MESSAGE_MAX));
              setError('');
            }}
            rows={4}
            aria-invalid={error !== ''}
            className={`rounded-[10px] border p-3 text-sm text-ink focus-visible:focus-ring ${
              error ? 'border-danger bg-danger-bg' : 'border-[#E2E8F0]'
            }`}
          />
          <span className="text-xs text-[#475569]">
            {missingChars > 0
              ? `Faltan ${missingChars} ${missingChars === 1 ? 'carácter' : 'caracteres'}`
              : `${message.length}/${MESSAGE_MAX} caracteres`}
          </span>
        </label>

        <Select
          label="Vigencia de la propuesta"
          value={validDays}
          onChange={(e) => setValidDays(Number(e.target.value))}
        >
          {validityOptions.map((d) => (
            <option key={d} value={d}>
              {d} días
            </option>
          ))}
        </Select>

        <p className="flex items-start gap-2 text-xs text-[#475569]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          Si acepta, solo el primer hito queda en custodia. Los demás se cobran cuando cada etapa se cumple.
        </p>

        {error && (
          <p role="alert" className="rounded-block bg-danger-bg px-3 py-2 text-sm text-danger-text">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="primary" className="flex-1" onClick={submit}>
            Enviar presupuesto
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
