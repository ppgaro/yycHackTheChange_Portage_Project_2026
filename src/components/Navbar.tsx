import React from 'react';
import { BrandMark } from './BrandMark';
import { RotateCcw } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
}

export function Navbar({ onReset }: NavbarProps) {
  return (
    <header className="border-b border-line bg-white/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <BrandMark size="sm" />

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-paper border border-line text-slate-ink">
            Offline · No AI in scoring
          </span>

          <button
            type="button"
            onClick={onReset}
            aria-label="Reset demo and clear everything"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-line text-navy hover:bg-paper focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
