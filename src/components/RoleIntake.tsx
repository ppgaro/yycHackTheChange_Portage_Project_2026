import React from 'react';
import type { PortageState, PortageAction } from '../state/portage';
import { SCENARIOS } from '../data/scenarios';
import { ArrowRight, Sparkles } from 'lucide-react';

interface RoleIntakeProps {
  state: PortageState;
  dispatch: React.Dispatch<PortageAction>;
}

export function RoleIntake({ state, dispatch }: RoleIntakeProps) {
  const isDutiesBlank = state.dutiesInput.trim().length === 0;

  return (
    <section className="space-y-8 max-w-3xl mx-auto py-2">
      <div className="space-y-2">
        <h1
          tabIndex={-1}
          className="text-3xl font-black text-navy tracking-tight outline-none"
        >
          Tell us about your work
        </h1>
        <p className="text-slate-ink text-base">
          Start by describing what you actually do day to day. Portage identifies transferable skills from your everyday responsibilities.
        </p>
      </div>

      {/* Preset example buttons */}
      <fieldset className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
        <legend className="text-sm font-bold text-navy px-1">
          Or start from an example
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIOS.map((sc) => {
            const isSelected = state.scenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  dispatch({ type: 'START_SCENARIO', scenarioId: sc.id })
                }
                className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between gap-1 focus-visible:ring-2 focus-visible:ring-river-ink ${
                  isSelected
                    ? 'border-river-ink bg-river-ink/5 ring-1 ring-river-ink'
                    : 'border-line hover:border-river-ink/50 bg-paper/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-line text-slate-ink">
                    {sc.badge}
                  </span>
                  {isSelected && (
                    <span className="text-xs font-bold text-river-ink">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-navy mt-1">
                  {sc.from} → {sc.to}
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Intake Form */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-6">
        <div className="space-y-1.5">
          <label
            htmlFor="current-role"
            className="block text-sm font-bold text-navy"
          >
            Current role
          </label>
          <input
            id="current-role"
            type="text"
            value={state.currentRole}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'currentRole',
                value: e.target.value,
              })
            }
            placeholder="e.g. Facilities Supervisor, Hospitality Shift Lead..."
            className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper text-navy placeholder:text-slate-ink/50 focus:outline-none focus:ring-2 focus:ring-river-ink text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="duties-input"
              className="block text-sm font-bold text-navy"
            >
              What do you do day to day? One duty per line.
            </label>
            <span className="text-xs text-slate-ink">
              {state.dutiesInput.split('\n').filter((l) => l.trim()).length} duties
            </span>
          </div>
          <textarea
            id="duties-input"
            rows={6}
            value={state.dutiesInput}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'dutiesInput',
                value: e.target.value,
              })
            }
            placeholder="Maintained boiler schedule during winter peak periods...&#10;Logged daily consumption meters...&#10;Trained new technicians..."
            className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper text-navy placeholder:text-slate-ink/50 focus:outline-none focus:ring-2 focus:ring-river-ink text-sm font-mono leading-relaxed"
          />
          <p className="text-xs text-slate-ink">
            Don't include names, employers or contact details.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="target-role"
            className="block text-sm font-bold text-navy"
          >
            Role you want next
          </label>
          <input
            id="target-role"
            type="text"
            value={state.targetRole}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'targetRole',
                value: e.target.value,
              })
            }
            placeholder="e.g. Energy & Grid Operations Analyst, BI Analyst..."
            className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper text-navy placeholder:text-slate-ink/50 focus:outline-none focus:ring-2 focus:ring-river-ink text-sm"
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={isDutiesBlank}
            onClick={() => dispatch({ type: 'ANALYZE' })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-ember-ink text-white font-bold hover:bg-navy transition-colors focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Find my transferable skills</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
