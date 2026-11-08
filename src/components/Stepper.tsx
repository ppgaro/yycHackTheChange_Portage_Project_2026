import React from 'react';
import { Step, STEPS, STEP_LABELS } from '../state/portage';

interface StepperProps {
  step: Step;
  maxReached: number;
  onGoTo: (s: Step) => void;
}

export function Stepper({ step, maxReached, onGoTo }: StepperProps) {
  // Only show steps beyond welcome (intake, skills, next, practice, evidence)
  const visibleSteps = STEPS.filter((s) => s !== 'welcome');
  const currentIdx = STEPS.indexOf(step);

  return (
    <nav aria-label="Progress" className="mx-auto max-w-5xl px-4 pt-6 pb-2">
      <ol className="flex items-center justify-between w-full">
        {visibleSteps.map((s, index) => {
          const sIdx = STEPS.indexOf(s);
          const isCurrent = s === step;
          const isPast = sIdx < currentIdx;
          const isDisabled = sIdx > maxReached;

          return (
            <li key={s} className="flex-1 flex items-center relative">
              <button
                type="button"
                onClick={() => onGoTo(s)}
                disabled={isDisabled}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-2 group cursor-pointer disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-river-ink rounded-lg p-1 ${
                  isDisabled ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCurrent
                      ? 'bg-navy text-white ring-2 ring-river-ink'
                      : isPast
                        ? 'bg-river-ink text-white'
                        : 'bg-paper border border-line text-slate-ink'
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    isCurrent
                      ? 'text-navy font-bold'
                      : isPast
                        ? 'text-river-ink'
                        : 'text-slate-ink'
                  }`}
                >
                  {STEP_LABELS[s]}
                </span>
              </button>

              {index < visibleSteps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    sIdx < currentIdx ? 'bg-river-ink' : 'bg-line'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
