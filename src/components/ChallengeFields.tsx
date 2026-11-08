import React from 'react';
import type {
  Challenge,
  ChallengeVariant,
  LearnerResponse,
  Field,
} from '../types/domain';
import type { PortageAction } from '../state/portage';

interface ChallengeFieldsProps {
  challenge: Challenge;
  variant: ChallengeVariant;
  response: LearnerResponse;
  dispatch: React.Dispatch<PortageAction>;
  attemptNumber: number;
}

export function ChallengeFields({
  challenge,
  variant,
  response,
  dispatch,
  attemptNumber,
}: ChallengeFieldsProps) {
  const wordCount = response.text.trim().split(/\s+/).filter(Boolean).length;

  const renderField = (field: Field) => {
    switch (field.kind) {
      case 'number': {
        const value = response.inputs[field.id] ?? '';
        return (
          <div key={field.id} className="space-y-1.5">
            <label
              htmlFor={`field-${field.id}`}
              className="block text-sm font-bold text-navy"
            >
              {field.label}
            </label>
            <div className="relative max-w-xs">
              <input
                id={`field-${field.id}`}
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_INPUT',
                    id: field.id,
                    value: e.target.value,
                  })
                }
                placeholder="0.00"
                className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-line bg-paper text-navy font-mono text-sm focus:outline-none focus:ring-2 focus:ring-river-ink"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-ink pointer-events-none">
                {field.unit}
              </span>
            </div>
          </div>
        );
      }

      case 'choice': {
        const selected = response.inputs[field.id] ?? '';
        return (
          <fieldset key={field.id} className="space-y-3">
            <legend className="text-sm font-bold text-navy">
              {field.label}
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {field.options.map((opt) => {
                const optId = `opt-${field.id}-${opt.id}`;
                const isChecked = selected === opt.id;
                return (
                  <label
                    key={opt.id}
                    htmlFor={optId}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors text-xs font-medium ${
                      isChecked
                        ? 'border-river-ink bg-river-ink/5 ring-1 ring-river-ink text-navy'
                        : 'border-line hover:border-river-ink/40 bg-paper/40 text-slate-ink'
                    }`}
                  >
                    <input
                      id={optId}
                      type="radio"
                      name={`choice-${field.id}`}
                      value={opt.id}
                      checked={isChecked}
                      onChange={() =>
                        dispatch({
                          type: 'SET_INPUT',
                          id: field.id,
                          value: opt.id,
                        })
                      }
                      className="text-river-ink focus:ring-river-ink h-4 w-4"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      }

      case 'classify': {
        const statements = variant.statements ?? [];
        return (
          <fieldset key={field.id} className="space-y-4">
            <legend className="text-sm font-bold text-navy">
              {field.label}
            </legend>
            <div className="space-y-2.5">
              {statements.map((stmt) => {
                const inputKey = `statements:${stmt.id}`;
                const currentVal = response.inputs[inputKey] ?? '';
                const shownRadioId = `stmt-${stmt.id}-shown`;
                const notShownRadioId = `stmt-${stmt.id}-not-shown`;

                return (
                  <div
                    key={stmt.id}
                    className="p-3.5 rounded-xl border border-line bg-paper/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-medium text-navy flex-1">
                      {stmt.text}
                    </span>

                    <div className="flex items-center gap-4 shrink-0">
                      <label
                        htmlFor={shownRadioId}
                        className="inline-flex items-center gap-1.5 cursor-pointer text-slate-ink hover:text-navy"
                      >
                        <input
                          id={shownRadioId}
                          type="radio"
                          name={inputKey}
                          value="shown"
                          checked={currentVal === 'shown'}
                          onChange={() =>
                            dispatch({
                              type: 'SET_INPUT',
                              id: inputKey,
                              value: 'shown',
                            })
                          }
                          className="text-river-ink focus:ring-river-ink h-4 w-4"
                        />
                        <span>Shown by the data</span>
                      </label>

                      <label
                        htmlFor={notShownRadioId}
                        className="inline-flex items-center gap-1.5 cursor-pointer text-slate-ink hover:text-navy"
                      >
                        <input
                          id={notShownRadioId}
                          type="radio"
                          name={inputKey}
                          value="not-shown"
                          checked={currentVal === 'not-shown'}
                          onChange={() =>
                            dispatch({
                              type: 'SET_INPUT',
                              id: inputKey,
                              value: 'not-shown',
                            })
                          }
                          className="text-river-ink focus:ring-river-ink h-4 w-4"
                        />
                        <span>Not shown by this data</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>
        );
      }

      case 'text': {
        return (
          <div key={field.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="response-text"
                className="block text-sm font-bold text-navy"
              >
                {field.label}
              </label>
              <span className="text-xs text-slate-ink font-mono">
                {wordCount} words
              </span>
            </div>
            <textarea
              id="response-text"
              rows={field.rows}
              value={response.text}
              onChange={(e) =>
                dispatch({ type: 'SET_TEXT', text: e.target.value })
              }
              placeholder="Write your brief or analysis here based on the data and your decisions above..."
              className="w-full px-4 py-3 rounded-xl border border-line bg-paper text-navy placeholder:text-slate-ink/50 focus:outline-none focus:ring-2 focus:ring-river-ink text-sm leading-relaxed"
            />
          </div>
        );
      }

      default: {
        const _exhaustive: never = field;
        return null;
      }
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h2 className="text-lg font-bold text-navy">Your decisions</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-paper border border-line text-slate-ink">
          Attempt #{attemptNumber}
        </span>
      </div>

      <div className="space-y-6">
        {challenge.fields.map((f) => renderField(f))}
      </div>
    </div>
  );
}
