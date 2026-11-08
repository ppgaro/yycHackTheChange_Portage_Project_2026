import {
  DutyMapping,
  DataSource,
  CriterionChange,
  LearnerResponse,
} from '../types/domain';
import {
  PortageState,
  getActiveChallenge,
  getScenarioOf,
  getActiveVariant,
  isPracticeComplete,
} from '../state/portage';
import { displaySkill } from './experience';
import { compareAttempts } from './assessment';
import { selectLessons } from './microlearning';

export type EvidenceLevel = 'suggested' | 'confirmed' | 'demonstrated' | 'rejected';

export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  suggested: 'Suggested by Portage',
  confirmed: 'Confirmed by you',
  demonstrated: 'Demonstrated in practice',
  rejected: 'Rejected by you',
};

export const EVIDENCE_DISCLAIMER =
  'An inspectable record of practice and improvement, not an employer-verified credential or professional certification.';

export const ASSESSMENT_LIMITS =
  'Scored by fixed, published rules on one bounded practice task. Free-text checks look for required elements and phrases; they do not understand meaning the way a person does.';

export function getEvidenceLevel(m: DutyMapping, s: PortageState): EvidenceLevel {
  if (m.status === 'rejected') return 'rejected';
  if (m.status === 'suggested') return 'suggested';

  const ch = getActiveChallenge(s);
  const sc = getScenarioOf(s);
  const gap = sc.gaps.find((g) => g.id === ch.gapId);

  if (isPracticeComplete(s) && gap && gap.supportedByMappingIds.includes(m.id)) {
    return 'demonstrated';
  }
  return 'confirmed';
}

export interface EvidenceRecord {
  product: 'Portage';
  generatedAt: string;
  label: string;
  transition: { from: string; to: string };
  confirmedSkills: {
    skill: string;
    sourceDuty: string;
    level: 'confirmed' | 'demonstrated';
  }[];
  objective: { gap: string; challenge: string } | null;
  practice: null | {
    variant: string;
    attempts: number;
    firstScore: string;
    latestScore: string;
    objectiveDemonstrated: boolean;
    criteria: {
      title: string;
      first: boolean;
      latest: boolean;
      change: CriterionChange;
    }[];
    lessonsShown: string[];
    firstAttempt: LearnerResponse;
    latestAttempt: LearnerResponse;
  };
  source: DataSource | null;
  limitations: string[];
}

export function buildEvidenceRecord(
  s: PortageState,
  generatedAt: string
): EvidenceRecord {
  const confirmedSkills = s.mappings
    .map((m) => {
      const level = getEvidenceLevel(m, s);
      return {
        skill: displaySkill(m),
        sourceDuty: m.sourceDuty,
        level,
      };
    })
    .filter(
      (m): m is { skill: string; sourceDuty: string; level: 'confirmed' | 'demonstrated' } =>
        m.level === 'confirmed' || m.level === 'demonstrated'
    );

  const ch = getActiveChallenge(s);
  const sc = getScenarioOf(s);
  const gap = sc.gaps.find((g) => g.id === ch.gapId);
  const objective = gap
    ? { gap: gap.name, challenge: ch.title }
    : null;

  const variantAttempts = s.attempts.filter((a) => a.variantId === s.variantId);
  let practice: EvidenceRecord['practice'] = null;

  if (variantAttempts.length > 0) {
    const firstAttempt = variantAttempts[0];
    const latestAttempt = variantAttempts[variantAttempts.length - 1];
    const changes = compareAttempts(firstAttempt.result, latestAttempt.result);

    const criteria = ch.criteria.map((crit) => {
      const firstPassed =
        firstAttempt.result.criteria.find((c) => c.criterionId === crit.id)?.passed ??
        false;
      const latestPassed =
        latestAttempt.result.criteria.find((c) => c.criterionId === crit.id)?.passed ??
        false;
      const change =
        changes.find((c) => c.criterionId === crit.id)?.change ?? 'still-missing';

      return {
        title: crit.title,
        first: firstPassed,
        latest: latestPassed,
        change,
      };
    });

    const lessonsShown = selectLessons(ch, firstAttempt.result).map(
      (l) => l.lesson.title
    );

    practice = {
      variant: getActiveVariant(s).label,
      attempts: variantAttempts.length,
      firstScore: `${firstAttempt.result.score}/${firstAttempt.result.maxScore}`,
      latestScore: `${latestAttempt.result.score}/${latestAttempt.result.maxScore}`,
      objectiveDemonstrated: latestAttempt.result.passed,
      criteria,
      lessonsShown,
      firstAttempt: firstAttempt.response,
      latestAttempt: latestAttempt.response,
    };
  }

  const activeVariant = getActiveVariant(s);
  const source = activeVariant ? activeVariant.source : null;

  const limitations = [ASSESSMENT_LIMITS];
  if (source && source.limitations) {
    limitations.push(source.limitations);
  }

  return {
    product: 'Portage',
    generatedAt,
    label: EVIDENCE_DISCLAIMER,
    transition: {
      from: s.currentRole,
      to: s.targetRole,
    },
    confirmedSkills,
    objective,
    practice,
    source,
    limitations,
  };
}

export function buildEvidenceMarkdown(r: EvidenceRecord): string {
  const lines: string[] = [];

  lines.push('# Portage practice evidence');
  lines.push('');
  lines.push(`> ${r.label}`);
  lines.push('');
  lines.push('## Career transition');
  lines.push(`- **From:** ${r.transition.from || 'Not specified'}`);
  lines.push(`- **To:** ${r.transition.to || 'Not specified'}`);
  lines.push(`- **Generated at:** ${r.generatedAt}`);
  lines.push('');

  lines.push('## Confirmed transferable skills');
  if (r.confirmedSkills.length === 0) {
    lines.push('None confirmed yet.');
  } else {
    for (const item of r.confirmedSkills) {
      const levelLabel =
        item.level === 'demonstrated'
          ? 'Demonstrated in practice'
          : 'Confirmed by you';
      lines.push(
        `- **${item.skill}** (${levelLabel}) — based on: *"${item.sourceDuty}"*`
      );
    }
  }
  lines.push('');

  lines.push('## Practice objective');
  if (r.objective) {
    lines.push(`- **Skill gap:** ${r.objective.gap}`);
    lines.push(`- **Practice task:** ${r.objective.challenge}`);
  } else {
    lines.push('No objective set.');
  }
  lines.push('');

  lines.push('## Practice record');
  if (!r.practice) {
    lines.push('No practice attempt yet.');
  } else {
    lines.push(`- **Data interval / scenario:** ${r.practice.variant}`);
    lines.push(`- **Attempts completed:** ${r.practice.attempts}`);
    lines.push(`- **Initial score:** ${r.practice.firstScore}`);
    lines.push(`- **Latest score:** ${r.practice.latestScore}`);
    if (r.practice.objectiveDemonstrated) {
      lines.push('');
      lines.push('**Practice objective demonstrated.**');
    }
    lines.push('');
    lines.push('### Published criteria results');
    for (const c of r.practice.criteria) {
      const changeText =
        c.change === 'gained'
          ? 'Gained'
          : c.change === 'kept'
            ? 'Kept'
            : c.change === 'lost'
              ? 'Lost'
              : 'Still missing';
      lines.push(
        `- **${c.title}**: ${c.latest ? 'Met' : 'Not yet'} (${changeText}, First: ${c.first ? 'Met' : 'Not yet'})`
      );
    }

    if (r.practice.lessonsShown.length > 0) {
      lines.push('');
      lines.push('### Micro-lessons reviewed');
      for (const lesson of r.practice.lessonsShown) {
        lines.push(`- ${lesson}`);
      }
    }

    lines.push('');
    lines.push('### Latest briefing text');
    lines.push(r.practice.latestAttempt.text || '*(No text submitted)*');
  }
  lines.push('');

  lines.push('## Data source');
  if (r.source) {
    lines.push(`- **Source name:** ${r.source.name}`);
    lines.push(`- **Kind:** ${r.source.kind}`);
    if (r.source.publisher) lines.push(`- **Publisher:** ${r.source.publisher}`);
    if (r.source.period) lines.push(`- **Period:** ${r.source.period}`);
    if (r.source.timeBasis) lines.push(`- **Time basis:** ${r.source.timeBasis}`);
    if (r.source.units) lines.push(`- **Units:** ${r.source.units.join(', ')}`);
    if (r.source.url) lines.push(`- **Reference URL:** ${r.source.url}`);
  } else {
    lines.push('No data source recorded.');
  }
  lines.push('');

  lines.push('## Assessment limitations');
  for (const lim of r.limitations) {
    lines.push(`- ${lim}`);
  }

  return lines.join('\n');
}

export const exportEvidenceMarkdown = buildEvidenceMarkdown;
