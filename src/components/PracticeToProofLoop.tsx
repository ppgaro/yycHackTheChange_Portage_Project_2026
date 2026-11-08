import React from 'react';
import type { PortageState, PortageAction } from '../state/portage';
import {
  getActiveChallenge,
  getActiveVariant,
  getLatestAttempt,
  isPracticeComplete,
} from '../state/portage';
import { compareAttempts } from '../engine/assessment';
import { selectLessons } from '../engine/microlearning';
import { DataPanel } from './DataPanel';
import { ChallengeFields } from './ChallengeFields';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react';

interface PracticeToProofLoopProps {
  state: PortageState;
  dispatch: React.Dispatch<PortageAction>;
}

export function PracticeToProofLoop({ state, dispatch }: PracticeToProofLoopProps) {
  const challenge = getActiveChallenge(state);
  const activeVariant = getActiveVariant(state);
  const latestAttempt = getLatestAttempt(state);
  const isComplete = isPracticeComplete(state);

  const firstAttempt = state.attempts.length > 0 ? state.attempts[0] : null;
  const hasMultipleAttempts = state.attempts.length >= 2 && firstAttempt && latestAttempt;

  const comparison = hasMultipleAttempts
    ? compareAttempts(firstAttempt.result, latestAttempt.result)
    : [];

  const lessons = latestAttempt ? selectLessons(challenge, latestAttempt.result) : [];

  const getChangeLabel = (change: string) => {
    switch (change) {
      case 'gained':
        return { label: 'Gained', style: 'text-river-ink bg-river-ink/10 font-bold' };
      case 'kept':
        return { label: 'Kept', style: 'text-navy bg-paper font-semibold' };
      case 'lost':
        return { label: 'Lost', style: 'text-ember-ink bg-ember-ink/10 font-bold' };
      case 'still-missing':
      default:
        return { label: 'Still missing', style: 'text-slate-ink bg-paper' };
    }
  };

  return (
    <section className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header with Title and Role Context */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-river-ink/10 text-river-ink border border-river-ink/20">
            {challenge.roleContext}
          </span>
          <span className="text-xs text-slate-ink">
            {state.attempts.length} attempt{state.attempts.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        <h1
          tabIndex={-1}
          className="text-3xl font-black text-navy tracking-tight outline-none"
        >
          {challenge.title}
        </h1>
      </div>

      {/* Variant Selector (if > 1) */}
      {challenge.variants.length > 1 && (
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-2">
          <label htmlFor="variant-select" className="block text-sm font-bold text-navy">
            Data interval
          </label>
          <select
            id="variant-select"
            value={state.variantId}
            onChange={(e) =>
              dispatch({ type: 'SELECT_VARIANT', variantId: e.target.value })
            }
            className="w-full max-w-md px-3 py-2 rounded-xl border border-line bg-paper text-navy text-sm font-medium focus:outline-none focus:ring-2 focus:ring-river-ink"
          >
            {challenge.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-ink">
            Changing the interval changes the numbers and the correct answers, and starts a new attempt.
          </p>
        </div>
      )}

      {/* Prompt / Your Task */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-2">
        <h2 className="text-xs font-bold text-slate-ink uppercase tracking-wider">
          Your task
        </h2>
        <p className="text-sm text-navy leading-relaxed font-medium">
          {challenge.prompt}
        </p>
      </div>

      {/* Data Panel */}
      <DataPanel variant={activeVariant} />

      {/* What a strong answer does */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-navy flex items-center gap-2">
          <Award className="w-5 h-5 text-river-ink" aria-hidden="true" />
          <span>What a strong answer does</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenge.criteria.map((crit, index) => (
            <div
              key={crit.id}
              className="p-4 rounded-xl border border-line bg-paper/50 space-y-1.5"
            >
              <div className="text-xs font-bold text-navy">
                {index + 1}. {crit.title}
              </div>
              <p className="text-xs text-slate-ink leading-relaxed">
                {crit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge Fields */}
      <ChallengeFields
        challenge={challenge}
        variant={activeVariant}
        response={state.response}
        dispatch={dispatch}
        attemptNumber={state.attempts.length + 1}
      />

      {/* Submission & Shortcuts */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: 'SUBMIT_ATTEMPT',
              timestamp: new Date().toISOString(),
            })
          }
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ember-ink text-white font-bold hover:bg-navy transition-colors focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer text-sm shadow-sm"
        >
          <span>Check my answer</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="space-y-1 sm:text-right">
          <div className="text-xs font-bold text-slate-ink">Demo shortcuts</div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => dispatch({ type: 'LOAD_SAMPLE', which: 'baseline' })}
              className="px-3 py-1.5 rounded-lg border border-line text-xs font-semibold text-navy hover:bg-paper cursor-pointer transition-colors"
            >
              Load sample first attempt
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'LOAD_SAMPLE', which: 'revision' })}
              className="px-3 py-1.5 rounded-lg border border-line text-xs font-semibold text-navy hover:bg-paper cursor-pointer transition-colors"
            >
              Load sample revision
            </button>
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {isComplete && (
        <div className="rounded-2xl border-2 border-river-ink bg-river-ink/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-river-ink shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-navy">
                Practice objective demonstrated.
              </h2>
              <p className="text-xs text-slate-ink">
                You met all 4 criteria on this task. Portage won't show more lessons for it.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'GO_TO', step: 'evidence' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-river-ink text-white font-bold hover:bg-navy transition-colors focus-visible:ring-2 focus-visible:ring-river-ink cursor-pointer text-sm shadow-sm"
          >
            <span>See your evidence</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Results Section */}
      {latestAttempt && (
        <section
          aria-live="polite"
          className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-xl font-bold text-navy">
              {latestAttempt.result.score} of 4 criteria met
            </h2>
            <span className="text-xs text-slate-ink font-mono">
              Attempt #{latestAttempt.attemptNumber}
            </span>
          </div>

          <div className="space-y-4">
            {latestAttempt.result.criteria.map((cr) => {
              const critDef = challenge.criteria.find((c) => c.id === cr.criterionId);
              return (
                <div
                  key={cr.criterionId}
                  className={`p-4 rounded-xl border space-y-2 ${
                    cr.passed
                      ? 'border-river-ink/30 bg-river-ink/5'
                      : 'border-line bg-paper/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {cr.passed ? (
                        <CheckCircle2
                          className="w-5 h-5 text-river-ink shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <XCircle
                          className="w-5 h-5 text-slate-ink shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-sm font-bold text-navy">
                        {critDef?.title ?? cr.criterionId}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        cr.passed
                          ? 'bg-river-ink text-white'
                          : 'bg-paper border border-line text-slate-ink'
                      }`}
                    >
                      {cr.passed ? 'Met' : 'Not yet'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-ink leading-relaxed pl-7">
                    {cr.feedback}
                  </p>

                  {cr.notes.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-ember-ink pl-7 space-y-0.5 font-medium">
                      {cr.notes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  )}

                  {cr.evidence && (
                    <div className="text-xs pl-7 pt-1">
                      <span className="text-slate-ink">Evidence from your answer: </span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-line text-navy">
                        "{cr.evidence}"
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Targeted Lessons */}
      {lessons.length > 0 && !isComplete && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-river-ink" aria-hidden="true" />
              <span>What to work on</span>
            </h2>
            <p className="text-xs text-slate-ink">
              Lessons appear only for criteria you haven't met yet.
            </p>
          </div>

          <div className="space-y-4">
            {lessons.map(({ criterionId, lesson }) => (
              <div
                key={criterionId}
                className="p-5 rounded-xl border border-line bg-paper space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy">{lesson.title}</h3>
                  <span className="text-xs text-slate-ink">{lesson.readTime}</span>
                </div>

                <div className="space-y-1">
                  <strong className="text-navy">Key Rule:</strong>
                  <p className="text-slate-ink leading-relaxed">{lesson.keyRule}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg border border-line bg-white space-y-1">
                    <span className="font-bold text-ember-ink">Instead of:</span>
                    <p className="text-slate-ink">{lesson.instead}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-line bg-white space-y-1">
                    <span className="font-bold text-river-ink">Try:</span>
                    <p className="text-slate-ink">{lesson.tryThis}</p>
                  </div>
                </div>

                <div className="pt-1 text-slate-ink italic">
                  <strong className="not-italic text-navy">Tip:</strong> {lesson.tip}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-ink text-center pt-2">
            Update your decisions above and check again.
          </p>
        </div>
      )}

      {/* Comparison (>= 2 attempts) */}
      {hasMultipleAttempts && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-river-ink" aria-hidden="true" />
              <span>How your answer changed</span>
            </h2>
            <p className="text-xs text-slate-ink">
              Comparing Attempt #{firstAttempt.attemptNumber} to Attempt #{latestAttempt.attemptNumber}
            </p>
          </div>

          {/* Criteria change table */}
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-paper text-navy font-bold uppercase tracking-wider border-b border-line">
                  <th scope="col" className="px-4 py-3">Criterion</th>
                  <th scope="col" className="px-4 py-3">First attempt</th>
                  <th scope="col" className="px-4 py-3">Latest attempt</th>
                  <th scope="col" className="px-4 py-3">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {comparison.map(({ criterionId, change }) => {
                  const crit = challenge.criteria.find((c) => c.id === criterionId);
                  const firstCrit = firstAttempt.result.criteria.find((c) => c.criterionId === criterionId);
                  const latestCrit = latestAttempt.result.criteria.find((c) => c.criterionId === criterionId);
                  const changeInfo = getChangeLabel(change);

                  return (
                    <tr key={criterionId} className="hover:bg-paper/40">
                      <td className="px-4 py-3 font-semibold text-navy">
                        {crit?.title ?? criterionId}
                      </td>
                      <td className="px-4 py-3">
                        {firstCrit?.passed ? (
                          <span className="text-river-ink font-semibold">Met</span>
                        ) : (
                          <span className="text-slate-ink">Not yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {latestCrit?.passed ? (
                          <span className="text-river-ink font-semibold">Met</span>
                        ) : (
                          <span className="text-slate-ink">Not yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${changeInfo.style}`}>
                          {changeInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Side by side text */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
              Text response comparison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-line bg-paper/50 space-y-1">
                <span className="font-bold text-slate-ink">
                  First attempt (Attempt #{firstAttempt.attemptNumber}):
                </span>
                <p className="text-navy font-mono whitespace-pre-wrap leading-relaxed">
                  {firstAttempt.response.text || '—'}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-line bg-paper/50 space-y-1">
                <span className="font-bold text-slate-ink">
                  Latest attempt (Attempt #{latestAttempt.attemptNumber}):
                </span>
                <p className="text-navy font-mono whitespace-pre-wrap leading-relaxed">
                  {latestAttempt.response.text || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
