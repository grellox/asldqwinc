import type { Lawyer } from '../../types';

/** Stand-in for the photo of the reference design: a stable, per-lawyer tinted tile. */
const palettes = [
  'from-[#E3EDFD] to-[#C7DBFB] text-[#1D4ED8]',
  'from-[#E0F2FE] to-[#BAE0FD] text-[#0C4A6E]',
  'from-[#EDE9FE] to-[#D9D0FB] text-[#4C1D95]',
  'from-[#DCFCE7] to-[#BBF7D0] text-[#166534]',
  'from-[#FEF3C7] to-[#FDE68A] text-[#92400E]',
  'from-[#E2E8F0] to-[#CBD5E1] text-[#334155]',
];

function paletteFor(id: string) {
  const sum = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palettes[sum % palettes.length];
}

interface LawyerMonogramProps {
  lawyer: Lawyer;
  className?: string;
  size?: 'card' | 'profile';
}

export function LawyerMonogram({ lawyer, className = '', size = 'card' }: LawyerMonogramProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-gradient-to-br ${paletteFor(lawyer.id)} ${className}`}
    >
      <span
        className={`font-serif font-medium leading-none ${size === 'card' ? 'text-5xl' : 'text-[40px]'}`}
      >
        {lawyer.initials}
      </span>
    </div>
  );
}
