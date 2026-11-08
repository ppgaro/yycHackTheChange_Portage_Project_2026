import React from 'react';
import type { ChallengeVariant } from '../types/domain';
import { Database, ExternalLink, AlertCircle, Info } from 'lucide-react';

interface DataPanelProps {
  variant: ChallengeVariant;
}

export function DataPanel({ variant }: DataPanelProps) {
  const { source, table, assumptions } = variant;
  const isObserved = source.kind === 'observed';

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-6">
      {/* Header with badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-river-ink" aria-hidden="true" />
          <h2 className="text-lg font-bold text-navy">Data Panel</h2>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
            isObserved
              ? 'bg-river-ink text-white'
              : 'bg-paper border border-line text-slate-ink'
          }`}
        >
          {isObserved ? 'Observed AESO data' : 'Fictional demonstration data'}
        </span>
      </div>

      {/* Accessible Table */}
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm border-collapse">
          <caption className="text-xs font-semibold text-slate-ink p-3 bg-paper border-b border-line text-left">
            {table.caption}
          </caption>
          <thead>
            <tr className="bg-paper text-navy font-bold text-xs uppercase tracking-wider border-b border-line">
              {table.columns.map((col) => (
                <th key={col.key} scope="col" className="px-4 py-3">
                  {col.label} {col.unit ? `(${col.unit})` : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line font-mono text-xs text-navy">
            {table.rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-paper/50 transition-colors">
                {table.columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5">
                    {String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Source and Limitations details for observed data */}
      {isObserved && (
        <details className="rounded-xl border border-line bg-paper/50 p-4 text-xs text-slate-ink space-y-3 group">
          <summary className="font-bold text-navy cursor-pointer hover:text-river-ink select-none flex items-center gap-2">
            <Info className="w-4 h-4 text-river-ink" aria-hidden="true" />
            <span>Source and limitations</span>
          </summary>
          <div className="pt-3 space-y-2 border-t border-line mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {source.publisher && (
                <div>
                  <strong className="text-navy">Publisher:</strong> {source.publisher}
                </div>
              )}
              {source.name && (
                <div>
                  <strong className="text-navy">Report:</strong> {source.name}
                </div>
              )}
              {source.period && (
                <div>
                  <strong className="text-navy">Period:</strong> {source.period}
                </div>
              )}
              {source.timeBasis && (
                <div>
                  <strong className="text-navy">Time basis:</strong> {source.timeBasis}
                </div>
              )}
              {source.units && source.units.length > 0 && (
                <div>
                  <strong className="text-navy">Units:</strong> {source.units.join(', ')}
                </div>
              )}
              {source.retrievedAt && (
                <div>
                  <strong className="text-navy">Retrieved:</strong> {source.retrievedAt}
                </div>
              )}
            </div>

            {source.url && (
              <div className="pt-1">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-river-ink hover:underline font-semibold"
                >
                  <span>{source.url}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            )}

            <div className="pt-2 text-slate-ink leading-relaxed">
              <strong className="text-navy">Limitations:</strong> {source.limitations}
            </div>
          </div>
        </details>
      )}

      {/* Scenario Assumptions */}
      {assumptions && (
        <div className="rounded-xl border border-line bg-paper p-4 space-y-1">
          <div className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-river-ink" aria-hidden="true" />
            <span>Scenario assumptions</span>
          </div>
          <p className="text-xs text-slate-ink leading-relaxed">
            {assumptions}
          </p>
        </div>
      )}
    </div>
  );
}
