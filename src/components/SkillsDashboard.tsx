import React, { useState } from 'react';
import type { PortageState, PortageAction } from '../state/portage';
import type { DutyMapping } from '../types/domain';
import {
  EVIDENCE_LABELS,
  getEvidenceLevel,
  EvidenceLevel,
} from '../engine/evidence';
import {
  ArrowRight,
  Check,
  Edit2,
  X,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Award,
} from 'lucide-react';

interface SkillsDashboardProps {
  state: PortageState;
  dispatch: React.Dispatch<PortageAction>;
}

export function SkillsDashboard({ state, dispatch }: SkillsDashboardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const mappings = state.mappings;

  if (mappings.length === 0) {
    return (
      <section className="space-y-6 max-w-3xl mx-auto py-8 text-center">
        <h1
          tabIndex={-1}
          className="text-3xl font-black text-navy tracking-tight outline-none"
        >
          Skills you may already have
        </h1>
        <p className="text-slate-ink text-base">
          No duties to work with yet. Add a few lines about your day-to-day work.
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'GO_TO', step: 'intake' })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-navy text-navy hover:bg-paper font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer"
        >
          Back to your experience
        </button>
      </section>
    );
  }

  const confirmedCount = mappings.filter(
    (m) => m.status === 'accepted' || m.status === 'edited'
  ).length;

  const hasSuggested = mappings.some((m) => m.status === 'suggested');

  const startEditing = (m: DutyMapping) => {
    setEditingId(m.id);
    setEditValue(m.userEditedSkill ?? m.transferableSkill);
  };

  const saveEditing = (id: string) => {
    if (!editValue.trim()) return;
    dispatch({
      type: 'SET_MAPPING_STATUS',
      id,
      status: 'edited',
      editedSkill: editValue.trim(),
    });
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const getBadgeStyle = (level: EvidenceLevel) => {
    switch (level) {
      case 'suggested':
        return 'border border-dashed border-slate-ink/40 text-slate-ink bg-transparent';
      case 'confirmed':
        return 'border border-river-ink bg-river-ink/10 text-river-ink font-semibold';
      case 'demonstrated':
        return 'border border-ember-ink bg-ember-ink/10 text-ember-ink font-semibold';
      case 'rejected':
        return 'border border-line bg-paper text-slate-ink/50 line-through';
    }
  };

  const renderBadgeIcon = (level: EvidenceLevel) => {
    switch (level) {
      case 'suggested':
        return <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />;
      case 'confirmed':
        return <Check className="w-3.5 h-3.5" aria-hidden="true" />;
      case 'demonstrated':
        return <Award className="w-3.5 h-3.5" aria-hidden="true" />;
      case 'rejected':
        return <X className="w-3.5 h-3.5" aria-hidden="true" />;
    }
  };

  return (
    <section className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="space-y-2">
        <h1
          tabIndex={-1}
          className="text-3xl font-black text-navy tracking-tight outline-none"
        >
          Skills you may already have
        </h1>
        <p className="text-slate-ink text-base">
          These are suggestions, not claims. Keep the ones that are true for you.
        </p>
      </div>

      {/* Legend & Controls Bar */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm font-bold text-navy">
            {confirmedCount} of {mappings.length} confirmed by you
          </div>

          {hasSuggested && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'ACCEPT_ALL_SUGGESTED' })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-river-ink text-white font-semibold text-xs hover:bg-navy transition-colors focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>Accept all suggestions</span>
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-line/60">
          <div className="text-xs font-semibold text-slate-ink mb-2">Evidence levels:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {(['suggested', 'confirmed', 'demonstrated', 'rejected'] as EvidenceLevel[]).map(
              (lvl) => (
                <div
                  key={lvl}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${getBadgeStyle(
                    lvl
                  )}`}
                >
                  {renderBadgeIcon(lvl)}
                  <span>{EVIDENCE_LABELS[lvl]}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mappings List */}
      <div className="space-y-4">
        {mappings.map((m) => {
          const isEditing = editingId === m.id;
          const displaySkill =
            m.status === 'edited' && m.userEditedSkill
              ? m.userEditedSkill
              : m.transferableSkill;
          const level = getEvidenceLevel(m, state);

          return (
            <div
              key={m.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm transition-all space-y-4 ${
                m.status === 'rejected'
                  ? 'border-line/60 opacity-60 bg-paper/30'
                  : 'border-line'
              }`}
            >
              {/* Crossing Layout: What you said -> Suggested skill */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Source Duty */}
                <div className="md:col-span-5 space-y-1">
                  <div className="text-xs font-bold text-slate-ink uppercase tracking-wider">
                    What you said you do
                  </div>
                  <blockquote className="text-sm font-medium text-navy italic border-l-2 border-river-ink/40 pl-3 py-0.5">
                    "{m.sourceDuty}"
                  </blockquote>
                </div>

                {/* River Arrow */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center pt-5">
                  <ArrowRight className="w-5 h-5 text-river-ink" aria-hidden="true" />
                </div>

                {/* Target / Inferred Skill */}
                <div className="md:col-span-6 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs font-bold text-slate-ink uppercase tracking-wider">
                      Suggested skill
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ${getBadgeStyle(
                        level
                      )}`}
                    >
                      {renderBadgeIcon(level)}
                      <span>{EVIDENCE_LABELS[level]}</span>
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        aria-label={`Edit ${displaySkill}`}
                        className="w-full px-3 py-1.5 rounded-lg border border-river-ink bg-white text-navy text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-river-ink"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={!editValue.trim()}
                          onClick={() => saveEditing(m.id)}
                          aria-label={`Save ${displaySkill}`}
                          className="px-3 py-1 rounded-lg bg-river-ink text-white font-semibold text-xs hover:bg-navy disabled:opacity-50 cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          aria-label={`Cancel editing ${displaySkill}`}
                          className="px-3 py-1 rounded-lg border border-line text-slate-ink hover:text-navy text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-navy">
                        {displaySkill}
                      </span>
                      {m.status === 'edited' && (
                        <span className="text-xs px-2 py-0.5 rounded bg-paper border border-line text-slate-ink font-medium">
                          edited by you
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-ink leading-relaxed">
                    <strong className="text-navy">Why it might transfer:</strong> {m.whyItTransfers}
                  </p>

                  {m.reference && (
                    <div className="text-xs pt-1">
                      <a
                        href={m.reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-river-ink hover:underline font-medium"
                      >
                        <span>{m.reference.label}</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-line/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_MAPPING_STATUS',
                      id: m.id,
                      status: 'accepted',
                    })
                  }
                  aria-label={`Keep ${displaySkill}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-river-ink ${
                    m.status === 'accepted'
                      ? 'bg-river-ink text-white'
                      : 'border border-line text-navy hover:bg-paper'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Keep</span>
                </button>

                <button
                  type="button"
                  onClick={() => startEditing(m)}
                  aria-label={`Edit ${displaySkill}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-navy hover:bg-paper text-xs font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-river-ink"
                >
                  <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_MAPPING_STATUS',
                      id: m.id,
                      status: 'rejected',
                    })
                  }
                  aria-label={`Not me: remove ${displaySkill}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-river-ink ${
                    m.status === 'rejected'
                      ? 'bg-slate-ink/20 text-slate-ink'
                      : 'border border-line text-slate-ink hover:text-navy hover:bg-paper'
                  }`}
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Not me</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
