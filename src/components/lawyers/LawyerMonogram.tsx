import type { Lawyer } from '../../types';

interface LawyerMonogramProps {
  lawyer: Lawyer;
  className?: string;
  size?: 'card' | 'profile';
}

/**
 * The portrait slot of a lawyer card. Lawyers without a photo get initials on
 * the same pale blue the drawn portraits sit on, so a grid mixing the two
 * reads as one set rather than a patchwork.
 */
export function LawyerMonogram({ lawyer, className = '', size = 'card' }: LawyerMonogramProps) {
  if (lawyer.photo) {
    return (
      <img
        src={lawyer.photo}
        alt=""
        loading="lazy"
        decoding="async"
        className={`w-full bg-tint object-cover object-top ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-tint ${className}`}
    >
      <span
        className={`font-serif font-medium leading-none text-[#7FA3DC] ${
          size === 'card' ? 'text-5xl' : 'text-[40px]'
        }`}
      >
        {lawyer.initials}
      </span>
    </div>
  );
}
