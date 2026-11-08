import { Scenario, SkillGap, DutyMapping } from '../types/domain';

export interface RankedGap {
  gap: SkillGap;
  score: number;
  reasons: string[];
  demonstrated: boolean;
  hasChallenge: boolean;
}

export function prioritizeGaps(
  scenario: Scenario,
  mappings: DutyMapping[],
  demonstratedGapIds: string[]
): { ranked: RankedGap[]; recommended: RankedGap | null } {
  const confirmedMappingIds = new Set(
    mappings
      .filter((m) => m.status === 'accepted' || m.status === 'edited')
      .map((m) => m.id)
  );

  const ranked: RankedGap[] = scenario.gaps.map((gap) => {
    const demonstrated = demonstratedGapIds.includes(gap.id);
    const hasChallenge = Boolean(gap.challengeId);
    const confirmedCount = gap.supportedByMappingIds.filter((id) =>
      confirmedMappingIds.has(id)
    ).length;

    const score = gap.relevance * 3 + 2 * gap.prerequisiteFor.length + confirmedCount;

    const reasons: string[] = [];
    reasons.push(`Relevance to ${scenario.to}: ${gap.relevance}/3`);

    if (gap.prerequisiteFor.length > 0) {
      reasons.push(`Unlocks ${gap.prerequisiteFor.length} later skill(s)`);
    }

    if (confirmedCount > 0) {
      reasons.push(`Builds on ${confirmedCount} skill(s) you confirmed`);
    }

    reasons.push(hasChallenge ? 'Has a practice task ready' : 'No practice task yet');

    if (demonstrated) {
      reasons.push('Already demonstrated in Portage');
    }

    return {
      gap,
      score,
      reasons,
      demonstrated,
      hasChallenge,
    };
  });

  ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.gap.id.localeCompare(b.gap.id);
  });

  const recommended =
    ranked.find((r) => !r.demonstrated && r.hasChallenge) ?? null;

  return { ranked, recommended };
}
