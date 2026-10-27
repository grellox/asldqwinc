import { responseLabel } from '../../data/lawyers';
import type { Lawyer } from '../../types';

export function CompareTable({ lawyers: compared }: { lawyers: Lawyer[] }) {
  if (compared.length === 0) {
    return <p className="text-sm text-[#475569]">Selecciona abogados para comparar.</p>;
  }

  const rows: {
    label: string;
    getValue: (l: Lawyer) => number;
    format: (value: number) => string;
    best: 'max' | 'min';
  }[] = [
    { label: 'Precio por hito', getValue: (l) => l.pricePerHito, format: (v) => `S/ ${v}`, best: 'min' },
    { label: 'Calificación', getValue: (l) => l.rating, format: (v) => v.toFixed(1), best: 'max' },
    { label: 'Reseñas', getValue: (l) => l.reviewsCount, format: (v) => `${v} reseñas`, best: 'max' },
    { label: 'Casos atendidos', getValue: (l) => l.casesCount, format: (v) => `${v}`, best: 'max' },
    {
      label: 'Tiempo de respuesta',
      getValue: (l) => l.responseHours,
      format: (v) => responseLabel(v),
      best: 'min',
    },
    {
      label: 'Años de experiencia',
      getValue: (l) => l.yearsExperience,
      format: (v) => `${v} años`,
      best: 'max',
    },
    { label: 'Sentencias favorables', getValue: (l) => l.successRate, format: (v) => `${v} %`, best: 'max' },
    {
      label: 'Duración promedio',
      getValue: (l) => l.avgResolutionMonths,
      format: (v) => `${v} meses`,
      best: 'min',
    },
  ];

  const textRows: { label: string; getValue: (l: Lawyer) => string }[] = [
    { label: 'Distrito', getValue: (l) => l.district },
    { label: 'Modalidad', getValue: (l) => l.modalidad },
    { label: 'Idiomas', getValue: (l) => l.languages.join(', ') },
    { label: 'Disponibilidad', getValue: (l) => (l.acceptingClients ? 'Acepta casos' : 'Agenda llena') },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr>
            <th className="w-40 pb-3 text-xs font-semibold uppercase tracking-[0.1em] text-link">Criterio</th>
            {compared.map((l) => (
              <th key={l.id} className="pb-3 pl-4 font-sans text-sm font-bold text-ink">
                {l.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const values = compared.map(row.getValue);
            const bestValue = row.best === 'max' ? Math.max(...values) : Math.min(...values);
            return (
              <tr key={row.label} className="border-t border-[#E2E8F0]">
                <td className="py-3 text-[#475569]">{row.label}</td>
                {compared.map((l) => {
                  const value = row.getValue(l);
                  const isBest = compared.length > 1 && value === bestValue;
                  return (
                    <td
                      key={l.id}
                      className={`py-3 pl-4 ${isBest ? 'font-bold text-brand-ink' : 'text-[#334155]'}`}
                    >
                      {row.format(value)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {textRows.map((row) => (
            <tr key={row.label} className="border-t border-[#E2E8F0]">
              <td className="py-3 text-[#475569]">{row.label}</td>
              {compared.map((l) => (
                <td key={l.id} className="py-3 pl-4 text-[#334155]">
                  {row.getValue(l)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
