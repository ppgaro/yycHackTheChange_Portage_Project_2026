import React from 'react';
import { LOGO } from '../brand';

interface BrandMarkProps {
  size: 'sm' | 'lg';
}

export function BrandMark({ size }: BrandMarkProps) {
  if (size === 'lg') {
    return (
      <img
        src={LOGO.full}
        alt="Portage — Your experience counts."
        className="h-auto w-full max-w-md"
      />
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <img
        src={LOGO.mark}
        alt=""
        aria-hidden="true"
        className="h-9 w-9 object-contain"
      />
      <span className="text-xl font-extrabold text-navy">Portage</span>
    </span>
  );
}
