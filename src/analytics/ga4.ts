import type { Step } from '../state/portage';
import { STEPS } from '../state/portage';

export const DEFAULT_GA_MEASUREMENT_ID = 'G-L9B7ME5TWL';

const FORBIDDEN_PARAM_KEYS = new Set([
  'dutiesInput',
  'currentRole',
  'targetRole',
  'text',
  'inputs',
  'editedSkill',
  'response',
  'sourceDuty',
  'userDuty',
]);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __portageGaInitialized?: boolean;
  }
}

export type SafeAnalyticsParams = Record<string, string | number | boolean>;

export function getGaMeasurementId(): string {
  const envId =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)
      : undefined;
  return (envId && envId.trim()) || DEFAULT_GA_MEASUREMENT_ID;
}

export function sanitizeAnalyticsParams(
  raw: Record<string, unknown>
): SafeAnalyticsParams {
  const safe: SafeAnalyticsParams = {};
  for (const [key, value] of Object.entries(raw)) {
    if (FORBIDDEN_PARAM_KEYS.has(key)) {
      continue;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      safe[key] = value;
    } else if (typeof value === 'string') {
      // Never allow multiline or long free-text payloads in GA4 parameters
      const trimmed = value.replace(/[\r\n]+/g, ' ').trim();
      safe[key] = trimmed.length > 64 ? trimmed.slice(0, 64) : trimmed;
    }
  }
  return safe;
}

export function initGa4(measurementId = getGaMeasurementId()): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) {
    return false;
  }

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }

  if (window.__portageGaInitialized) {
    return true;
  }

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const existingScript = document.querySelector(
    `script[src*="googletagmanager.com/gtag/js"]`
  );
  if (!existingScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      measurementId
    )}`;
    document.head.appendChild(script);
  }

  window.__portageGaInitialized = true;
  return true;
}

export function trackGaEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): SafeAnalyticsParams {
  const sanitized = sanitizeAnalyticsParams(params);
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, sanitized);
  }
  return sanitized;
}

export function trackStepView(step: Step, scenarioId: string): SafeAnalyticsParams {
  const stepIndex = STEPS.indexOf(step) + 1;
  return trackGaEvent('step_view', {
    step_name: step,
    step_index: stepIndex,
    scenario_id: scenarioId || 'custom',
    page_path: `/?scenario=${encodeURIComponent(scenarioId || 'custom')}&step=${encodeURIComponent(step)}`,
  });
}

export function trackScenarioSelected(
  scenarioId: string,
  entryMode: 'preset' | 'blank'
): SafeAnalyticsParams {
  return trackGaEvent('scenario_selected', {
    scenario_id: scenarioId || 'custom',
    entry_mode: entryMode,
  });
}

export function trackSkillsAnalyzed(
  scenarioId: string,
  mappedCount: number,
  unmatchedCount: number
): SafeAnalyticsParams {
  return trackGaEvent('skills_mapped', {
    scenario_id: scenarioId || 'custom',
    mapped_count: mappedCount,
    unmatched_count: unmatchedCount,
  });
}

export function trackSkillCurated(
  scenarioId: string,
  actionType: string
): SafeAnalyticsParams {
  return trackGaEvent('skill_curated', {
    scenario_id: scenarioId || 'custom',
    action_type: actionType,
  });
}

export function trackPracticeAttempt(
  scenarioId: string,
  attemptNumber: number,
  criteriaMet: number,
  criteriaTotal: number
): SafeAnalyticsParams {
  return trackGaEvent('practice_submitted', {
    scenario_id: scenarioId || 'custom',
    attempt_number: attemptNumber,
    criteria_met: criteriaMet,
    criteria_total: criteriaTotal,
    objective_demonstrated: criteriaMet === criteriaTotal,
  });
}

export function trackEvidenceExport(
  scenarioId: string,
  exportFormat: 'json' | 'markdown' | 'print',
  attemptsCount: number
): SafeAnalyticsParams {
  return trackGaEvent('evidence_exported', {
    scenario_id: scenarioId || 'custom',
    export_format: exportFormat,
    attempts_count: attemptsCount,
  });
}
