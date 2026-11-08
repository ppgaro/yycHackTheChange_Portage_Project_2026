import React from 'react';
import type { PortageState, PortageAction } from '../state/portage';
import { getGapRanking, getScenarioOf } from '../state/portage';
import { EVIDENCE_LABELS, getEvidenceLevel } from '../engine/evidence';
import { ArrowRight, Clock, Award, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface NextSkillCardProps {
  state: PortageState;
  dispatch: React.Dispatch<PortageAction>;
}

export function NextSkillCard({ state, dispatch }: NextSkillCardProps) {
  const ranking = getGapRanking(state);
  const scenario = getScenarioOf(state);
  const recommended = ranking.recommended;

  if (!recommended) {
    return (
      <section className="space-y-6 max-w-3xl mx-auto py-8 text-center">
        <h1
          tabIndex={-1}
          className="text-3xl font-black text-navy tracking-tight outline-none"
        >
          All practice objectives demonstrated
        </h1>
        <p className="text-slate-ink text-base">
          You've practised every task Portage has for this track so far.
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'GO_TO', step: 'evidence' })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-river-ink text-white font-bold hover:bg-navy transition-colors focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer text-sm shadow-sm"
        >
          <span>See your evidence</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </section>
    );
  }

  const gap = recommended.gap;
  const challenge = scenario.challenges.find((c) => c.id === gap.challengeId);
  const estimatedMinutes = challenge?.estimatedMinutes ?? 15;

  // Find linked mappings that support this gap
  const linkedMappings = state.mappings.filter((m) =>
    gap.supportedByMappingIds.includes(m.id)
  );

  // Other ranked gaps
  const otherGaps = ranking.ranked.filter((r) => r.gap.id !== gap.id);

  return (
    <section className="space-y-8 max-w-3xl mx-auto py-2">
      {/* Recommended Gap Card */}
      <div className="rounded-3xl border-2 border-river-ink/40 bg-white p-8 shadow-md space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-river-ink uppercase tracking-wider">
            Your next skill to practice
          </span>
          <h1
            tabIndex={-1}
            className="text-3xl font-black text-navy tracking-tight outline-none"
          >
            {gap.name}
          </h1>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-ink py-1 border-y border-line">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-4 h-4 text-river-ink" aria-hidden="true" />
            About {estimatedMinutes} minutes
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Award className="w-4 h-4 text-river-ink" aria-hidden="true" />
            4 published criteria
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-river-ink" aria-hidden="true" />
            No AI
          </span>
        </div>

        {/* Why Portage picked this */}
        <div className="space-y-2 rounded-2xl bg-paper p-5 border border-line">
          <h2 className="text-sm font-bold text-navy">
            Why Portage picked this
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-ink">
            {recommended.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
          <p className="text-xs text-slate-ink/80 pt-1 italic">
            Portage ranks skills by relevance to the role, what they unlock, and what you've confirmed. It never guesses your chances of getting hired.
          </p>
        </div>

        {/* Why it matters */}
        <div className="space-y-1.5">
          <h2 className="text-sm font-bold text-navy">Why it matters</h2>
          <p className="text-sm text-slate-ink leading-relaxed">
            {gap.whyItMatters}
          </p>
        </div>

        {/* How it builds on what you do */}
        {linkedMappings.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-navy">
              How it builds on what you do
            </h2>
            <div className="space-y-2">
              {linkedMappings.map((m) => {
                const level = getEvidenceLevel(m, state);
                const displaySkill = m.userEditedSkill ?? m.transferableSkill;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-line bg-paper/50 text-xs"
                  >
                    <span className="font-medium text-navy">{displaySkill}</span>
                    <span className="px-2 py-0.5 rounded-full border border-line bg-white text-slate-ink font-semibold">
                      {EVIDENCE_LABELS[level]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Why this task */}
        {gap.whyThisTask && (
          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-navy">Why this task</h2>
            <p className="text-sm text-slate-ink leading-relaxed">
              {gap.whyThisTask}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'GO_TO', step: 'practice' })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ember-ink text-white font-bold hover:bg-navy transition-colors focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer text-sm shadow-sm"
          >
            <span>Start the practice task</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Later: Other Ranked Gaps */}
      {otherGaps.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-navy">Later</h2>
          <div className="space-y-3">
            {otherGaps.map((rg) => (
              <div
                key={rg.gap.id}
                className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-navy">{rg.gap.name}</h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-paper border border-line text-slate-ink">
                    Score: {rg.score}
                  </span>
                </div>
                <p className="text-xs text-slate-ink">{rg.gap.description}</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-ink/80 pt-1">
                  {rg.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
