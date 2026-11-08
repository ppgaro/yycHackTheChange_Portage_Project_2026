import type { Step } from '../state/portage';
import { STEP_LABELS } from '../state/portage';
import { getScenario } from '../data/scenarios';
import { BRAND } from '../brand';

export const CANONICAL_ORIGIN = 'https://portage.wiki';

export interface PageSeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
}

export function buildSeoMetadata(
  step: Step,
  scenarioId: string
): PageSeoMetadata {
  const scenario = getScenario(scenarioId);

  if (step === 'welcome') {
    return {
      title: `${BRAND.name} — ${BRAND.tagline} | Practice-Based Career Transitions`,
      description: BRAND.description,
      canonicalUrl: `${CANONICAL_ORIGIN}/`,
    };
  }

  const stepLabel = STEP_LABELS[step] ?? 'Career Transition';
  if (scenario) {
    return {
      title: `${stepLabel}: ${scenario.from} → ${scenario.to} | ${BRAND.name}`,
      description: `${scenario.summary} ${BRAND.description}`,
      canonicalUrl: `${CANONICAL_ORIGIN}/?scenario=${encodeURIComponent(scenario.id)}`,
    };
  }

  return {
    title: `${stepLabel} | ${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    canonicalUrl: `${CANONICAL_ORIGIN}/`,
  };
}

export function syncDocumentSeo(step: Step, scenarioId: string): PageSeoMetadata {
  const meta = buildSeoMetadata(step, scenarioId);

  if (typeof document !== 'undefined') {
    document.title = meta.title;

    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content', meta.description);
    }

    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) {
      ogTitleEl.setAttribute('content', meta.title);
    }

    const ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) {
      ogDescEl.setAttribute('content', meta.description);
    }

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', meta.canonicalUrl);
    }
  }

  return meta;
}
