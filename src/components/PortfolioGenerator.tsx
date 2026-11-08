import React, { useMemo } from 'react';
import type { PortageState, PortageAction } from '../state/portage';
import { getScenarioOf } from '../state/portage';
import {
  buildEvidenceRecord,
  exportEvidenceMarkdown,
  EVIDENCE_DISCLAIMER,
  EVIDENCE_LABELS,
} from '../engine/evidence';
import { BrandMark } from './BrandMark';
import { trackEvidenceExport } from '../analytics/ga4';
import {
  Download,
  Printer,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';

interface PortfolioGeneratorProps {
  state: PortageState;
  dispatch: React.Dispatch<PortageAction>;
}

export function PortfolioGenerator({ state, dispatch }: PortfolioGeneratorProps) {
  const scenario = getScenarioOf(state);

  const record = useMemo(() => {
    return buildEvidenceRecord(state, new Date().toISOString());
  }, [state]);

  const handleDownloadJson = () => {
    trackEvidenceExport(state.scenarioId, 'json', state.attempts.length);
    const jsonStr = JSON.stringify(record, null, 2);
    downloadFile(jsonStr, 'portage-evidence.json', 'application/json');
  };

  const handleDownloadMarkdown = () => {
    trackEvidenceExport(state.scenarioId, 'markdown', state.attempts.length);
    const mdStr = exportEvidenceMarkdown(record);
    downloadFile(mdStr, 'portage-evidence.md', 'text/markdown');
  };

  const handlePrint = () => {
    trackEvidenceExport(state.scenarioId, 'print', state.attempts.length);
    window.print();
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getChangeBadge = (change: string) => {
    switch (change) {
      case 'gained':
        return <span className="px-2 py-0.5 rounded text-xs bg-river-ink/10 text-river-ink font-bold">Gained</span>;
      case 'kept':
        return <span className="px-2 py-0.5 rounded text-xs bg-paper text-navy font-semibold">Kept</span>;
      case 'lost':
        return <span className="px-2 py-0.5 rounded text-xs bg-ember-ink/10 text-ember-ink font-bold">Lost</span>;
      case 'still-missing':
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-paper text-slate-ink">Still missing</span>;
    }
  };

  return (
    <section className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Page Title & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <h1
          tabIndex={-1}
          className="text-3xl font-black text-navy tracking-tight outline-none"
        >
          Your practice evidence
        </h1>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-white hover:bg-paper text-navy font-semibold text-xs shadow-sm cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-river-ink"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download JSON</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-white hover:bg-paper text-navy font-semibold text-xs shadow-sm cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-river-ink"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download Markdown</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-river-ink text-white hover:bg-navy font-semibold text-xs shadow-sm cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-river-ink"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-white hover:bg-paper text-slate-ink hover:text-navy text-xs cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-river-ink"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear session</span>
          </button>
        </div>
      </div>

      {/* Branded Print Card */}
      <div className="print-card rounded-3xl border border-line bg-white p-8 shadow-sm space-y-8">
        {/* Header with BrandMark sm and transition */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <BrandMark size="sm" />
          <div className="text-right sm:text-right">
            <div className="text-sm font-extrabold text-navy">
              {record.transition.from || 'Current Role'} → {record.transition.to || 'Target Role'}
            </div>
            <div className="text-xs text-slate-ink font-mono mt-0.5">
              Generated: {new Date(record.generatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Visible Disclaimer near top */}
        <div className="p-4 rounded-xl border border-river-ink/20 bg-river-ink/5 text-xs text-slate-ink space-y-1">
          <div className="font-bold text-river-ink uppercase tracking-wider text-[11px] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Evidence Record Notice</span>
          </div>
          <p className="leading-relaxed font-medium text-navy/90">
            {EVIDENCE_DISCLAIMER}
          </p>
        </div>

        {/* Skills Confirmed By You */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-navy border-b border-line pb-2">
            Skills confirmed by you
          </h2>
          {record.confirmedSkills.length === 0 ? (
            <p className="text-xs text-slate-ink italic">None confirmed yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {record.confirmedSkills.map((cs, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-line bg-paper/40 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-navy">{cs.skill}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        cs.level === 'demonstrated'
                          ? 'bg-ember-ink/10 text-ember-ink border border-ember-ink/20'
                          : 'bg-river-ink/10 text-river-ink border border-river-ink/20'
                      }`}
                    >
                      {EVIDENCE_LABELS[cs.level]}
                    </span>
                  </div>
                  <blockquote className="text-slate-ink italic border-l border-line pl-2">
                    "{cs.sourceDuty}"
                  </blockquote>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Practice Objective */}
        {record.objective && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-navy border-b border-line pb-2">
              Practice objective
            </h2>
            <div className="p-4 rounded-xl border border-line bg-paper/40 text-xs space-y-1">
              <span className="font-bold text-navy text-sm">
                {record.objective.gap}
              </span>
              <p className="text-slate-ink font-medium">
                Task: {record.objective.challenge}
              </p>
            </div>
          </div>
        )}

        {/* Practice Record */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-navy border-b border-line pb-2">
            Practice record
          </h2>

          {record.practice === null ? (
            <div className="p-6 rounded-xl border border-line bg-paper/30 text-center space-y-3">
              <p className="text-xs text-slate-ink">No practice attempt yet.</p>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO', step: 'practice' })}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-river-ink text-white font-semibold text-xs hover:bg-navy cursor-pointer no-print"
              >
                <span>Go to the practice task</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Practice summary stats */}
              <div className="p-4 rounded-xl border border-line bg-paper/50 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-ink">Interval: </span>
                  <strong className="text-navy">{record.practice.variant}</strong>
                </div>
                <div>
                  <span className="text-slate-ink">Attempts: </span>
                  <strong className="text-navy">{record.practice.attempts}</strong>
                </div>
                <div>
                  <span className="text-slate-ink">Score progress: </span>
                  <strong className="text-navy">
                    {record.practice.firstScore} → {record.practice.latestScore}
                  </strong>
                </div>
                {record.practice.objectiveDemonstrated && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-river-ink text-white font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Practice objective demonstrated.</span>
                  </span>
                )}
              </div>

              {/* Criteria Table with Changes */}
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
                    {record.practice.criteria.map((c, i) => (
                      <tr key={i} className="hover:bg-paper/30">
                        <td className="px-4 py-2.5 font-medium text-navy">{c.title}</td>
                        <td className="px-4 py-2.5">
                          {c.first ? (
                            <span className="text-river-ink font-semibold">Met</span>
                          ) : (
                            <span className="text-slate-ink">Not yet</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {c.latest ? (
                            <span className="text-river-ink font-semibold">Met</span>
                          ) : (
                            <span className="text-slate-ink">Not yet</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">{getChangeBadge(c.change)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lessons Shown */}
              {record.practice.lessonsShown.length > 0 && (
                <div className="p-4 rounded-xl border border-line bg-paper/30 space-y-1 text-xs">
                  <span className="font-bold text-navy">Lessons reviewed:</span>
                  <p className="text-slate-ink">
                    {record.practice.lessonsShown.join(', ')}
                  </p>
                </div>
              )}

              {/* First vs Latest Answers */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                  Submitted decisions & text
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* First Attempt */}
                  <div className="p-4 rounded-xl border border-line bg-paper/30 space-y-3">
                    <span className="font-bold text-slate-ink uppercase tracking-wider text-[11px]">
                      First Attempt
                    </span>
                    {Object.keys(record.practice.firstAttempt.inputs).length > 0 && (
                      <dl className="grid grid-cols-2 gap-1.5 border-b border-line pb-2">
                        {Object.entries(record.practice.firstAttempt.inputs).map(
                          ([k, v]) => (
                            <React.Fragment key={k}>
                              <dt className="text-slate-ink font-medium truncate">{k}:</dt>
                              <dd className="font-mono text-navy font-semibold">{v}</dd>
                            </React.Fragment>
                          )
                        )}
                      </dl>
                    )}
                    <p className="text-navy font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                      {record.practice.firstAttempt.text || '—'}
                    </p>
                  </div>

                  {/* Latest Attempt */}
                  <div className="p-4 rounded-xl border border-line bg-paper/30 space-y-3">
                    <span className="font-bold text-slate-ink uppercase tracking-wider text-[11px]">
                      Latest Attempt
                    </span>
                    {Object.keys(record.practice.latestAttempt.inputs).length > 0 && (
                      <dl className="grid grid-cols-2 gap-1.5 border-b border-line pb-2">
                        {Object.entries(record.practice.latestAttempt.inputs).map(
                          ([k, v]) => (
                            <React.Fragment key={k}>
                              <dt className="text-slate-ink font-medium truncate">{k}:</dt>
                              <dd className="font-mono text-navy font-semibold">{v}</dd>
                            </React.Fragment>
                          )
                        )}
                      </dl>
                    )}
                    <p className="text-navy font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                      {record.practice.latestAttempt.text || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data Source Provenance */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-navy border-b border-line pb-2">
            Data source
          </h2>
          {record.source && record.source.kind === 'observed' ? (
            <div className="p-4 rounded-xl border border-line bg-paper/30 text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <strong className="text-navy">Publisher:</strong> {record.source.publisher}
                </div>
                <div>
                  <strong className="text-navy">Report:</strong> {record.source.name}
                </div>
                <div>
                  <strong className="text-navy">Period:</strong> {record.source.period}
                </div>
                <div>
                  <strong className="text-navy">Time basis:</strong> {record.source.timeBasis}
                </div>
              </div>
              {record.source.url && (
                <div className="pt-1">
                  <a
                    href={record.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-river-ink hover:underline font-semibold"
                  >
                    <span>{record.source.url}</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-ink">Fictional demonstration data</p>
          )}
        </div>

        {/* Limitations */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-navy border-b border-line pb-2">
            Limitations
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-ink">
            {record.limitations.map((lim, idx) => (
              <li key={idx} className="leading-relaxed">
                {lim}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keep Going section (optional, no-print) */}
      {scenario.nextSteps && scenario.nextSteps.length > 0 && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4 no-print">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Award className="w-5 h-5 text-river-ink" aria-hidden="true" />
            <span>Keep going</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenario.nextSteps.map((group, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-line bg-paper space-y-2 text-xs">
                <h3 className="font-bold text-navy text-sm">{group.title}</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-ink">
                  {group.items.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
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
