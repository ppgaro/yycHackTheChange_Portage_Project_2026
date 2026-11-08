import React from 'react';
import { PortageState, PortageAction } from '../state/portage';
import { SCENARIOS } from '../data/scenarios';
import { BRAND } from '../brand';
import { BrandMark } from './BrandMark';
import { ArrowRight, Compass, CheckCircle2, Award, Database } from 'lucide-react';

interface WelcomeProps {
  state: PortageState;
  dispatch: React.Dispatch<PortageAction>;
}

export function Welcome({ dispatch }: WelcomeProps) {
  const featured = SCENARIOS.find((s) => s.featured) ?? SCENARIOS[0];
  const others = SCENARIOS.filter((s) => !s.featured);

  return (
    <div className="space-y-12 py-4">
      {/* Hero section */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
        <BrandMark size="lg" />
        <h1 tabIndex={-1} className="text-4xl sm:text-5xl font-black text-navy tracking-tight outline-none">
          Your experience counts.
        </h1>
        <p className="text-xl font-medium text-navy/90">
          {BRAND.promise}
        </p>
        <p className="text-base text-slate-ink leading-relaxed">
          {BRAND.description}
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-paper flex items-center justify-center text-river-ink border border-line">
            <Compass className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-navy">Discover</h2>
          <p className="text-sm text-slate-ink leading-relaxed">
            See which of your everyday duties already map to skills in a new field.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-paper flex items-center justify-center text-river-ink border border-line">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-navy">Practice</h2>
          <p className="text-sm text-slate-ink leading-relaxed">
            Try a realistic task from the job you want, scored by clear, published rules.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-paper flex items-center justify-center text-river-ink border border-line">
            <Award className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-navy">Show</h2>
          <p className="text-sm text-slate-ink leading-relaxed">
            Leave with a record of what you did and how you improved.
          </p>
        </div>
      </div>

      {/* Featured Flagship Track: RigToRack */}
      <div className="rounded-3xl border-2 border-river-ink/30 bg-white p-8 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-navy text-white">
              {featured.badge}
            </span>
            <div className="text-2xl font-extrabold text-navy">
              {featured.from} → {featured.to}
            </div>
            <p className="text-slate-ink text-base">
              {featured.summary}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-river-ink">
              <Database className="w-4 h-4" aria-hidden="true" />
              <span>Uses real Alberta Electric System Operator (AESO) data</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => dispatch({ type: 'START_SCENARIO', scenarioId: featured.id })}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ember-ink text-white font-bold hover:bg-navy transition-colors focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer text-sm shadow-sm"
            >
              <span>Start the RigToRack demo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Other Scenarios */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-navy">
          Other career transitions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {others.map((scenario) => (
            <div
              key={scenario.id}
              className="rounded-2xl border border-line bg-white p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-paper border border-line text-slate-ink">
                  {scenario.badge}
                </span>
                <h3 className="text-base font-bold text-navy">
                  {scenario.from} → {scenario.to}
                </h3>
                <p className="text-xs text-slate-ink leading-relaxed">
                  {scenario.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dispatch({ type: 'START_SCENARIO', scenarioId: scenario.id })}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-navy text-navy hover:bg-paper font-semibold text-xs transition-colors focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer"
              >
                <span>Try this transition</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom entry alternative */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={() => dispatch({ type: 'START_BLANK' })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-line text-slate-ink hover:text-navy hover:bg-white text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer"
        >
          <span>Start with my own experience</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
