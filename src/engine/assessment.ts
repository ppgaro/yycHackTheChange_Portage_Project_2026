import {
  Challenge,
  ChallengeVariant,
  LearnerResponse,
  AssessmentResult,
  CriterionResult,
  CriterionChange,
  Rule,
} from '../types/domain';

export function parseNumberInput(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[,\$\s]/g, '');
  if (cleaned.trim() === '') return null;
  const num = Number(cleaned);
  if (isNaN(num)) return null;
  return num;
}

export function assess(
  challenge: Challenge,
  variant: ChallengeVariant,
  response: LearnerResponse
): AssessmentResult {
  const fieldLabelMap = new Map<string, string>();
  for (const f of challenge.fields) {
    fieldLabelMap.set(f.id, f.label);
  }

  const criteriaResults: CriterionResult[] = [];

  for (const criterion of challenge.criteria) {
    const notes: string[] = [];
    let evidence: string | undefined = undefined;

    for (const rule of criterion.rules) {
      evaluateRule(rule, criterion.title, variant, response, fieldLabelMap, notes, (ev) => {
        if (!evidence) {
          evidence = ev;
        }
      });
    }

    const passed = notes.length === 0;
    const feedback = passed ? criterion.passFeedback : criterion.failFeedback;

    criteriaResults.push({
      criterionId: criterion.id,
      passed,
      feedback,
      notes,
      ...(evidence ? { evidence } : {}),
    });
  }

  const score = criteriaResults.filter((c) => c.passed).length;
  const maxScore = criteriaResults.length;
  const passed = score === maxScore;

  return {
    passed,
    score,
    maxScore,
    criteria: criteriaResults,
  };
}

function evaluateRule(
  rule: Rule,
  criterionTitle: string,
  variant: ChallengeVariant,
  response: LearnerResponse,
  fieldLabelMap: Map<string, string>,
  notes: string[],
  setEvidence: (ev: string) => void
): void {
  switch (rule.kind) {
    case 'textAll': {
      let allMatch = true;
      let firstMatchStr: string | undefined;
      for (const pattern of rule.patterns) {
        const regex = new RegExp(pattern, 'i');
        const match = response.text.match(regex);
        if (!match) {
          allMatch = false;
        } else if (!firstMatchStr) {
          firstMatchStr = match[0];
        }
      }
      if (!allMatch) {
        notes.push(`Missing: ${criterionTitle} needs more detail.`);
      } else if (firstMatchStr) {
        setEvidence(firstMatchStr);
      }
      break;
    }
    case 'textAny': {
      let anyMatch = false;
      let firstMatchStr: string | undefined;
      for (const pattern of rule.patterns) {
        const regex = new RegExp(pattern, 'i');
        const match = response.text.match(regex);
        if (match) {
          anyMatch = true;
          if (!firstMatchStr) {
            firstMatchStr = match[0];
          }
        }
      }
      if (!anyMatch) {
        notes.push(`Missing: ${criterionTitle} needs more detail.`);
      } else if (firstMatchStr) {
        setEvidence(firstMatchStr);
      }
      break;
    }
    case 'textNone': {
      for (const pattern of rule.patterns) {
        const regex = new RegExp(pattern, 'i');
        const match = response.text.match(regex);
        if (match) {
          notes.push(`Remove: "${match[0]}"`);
          break;
        }
      }
      break;
    }
    case 'minWords': {
      const words = response.text.trim().split(/\s+/).filter(Boolean);
      if (words.length < rule.min) {
        notes.push(`Write at least ${rule.min} words (you wrote ${words.length}).`);
      }
      break;
    }
    case 'numberMatchesFact': {
      const label = fieldLabelMap.get(rule.input) ?? rule.input;
      const rawVal = response.inputs[rule.input];
      const parsed = rawVal !== undefined ? parseNumberInput(rawVal) : null;
      if (parsed === null) {
        notes.push(`${label}: not answered.`);
      } else {
        const factVal = Number(variant.facts[rule.fact]);
        if (Math.abs(parsed - factVal) > rule.tolerance) {
          notes.push(`${label}: check this value against the table.`);
        }
      }
      break;
    }
    case 'choiceEquals': {
      const label = fieldLabelMap.get(rule.input) ?? rule.input;
      const selected = response.inputs[rule.input];
      if (selected !== rule.expected) {
        notes.push(`${label}: reconsider this choice.`);
      }
      break;
    }
    case 'statementsClassified': {
      const statements = variant.statements ?? [];
      let incorrectCount = 0;
      for (const st of statements) {
        const key = `statements:${st.id}`;
        const ans = response.inputs[key];
        const expected = st.shownByData ? 'shown' : 'not-shown';
        if (ans !== expected) {
          incorrectCount++;
        }
      }
      if (incorrectCount > 0) {
        notes.push(`${incorrectCount} statement(s) classified incorrectly or left blank.`);
      }
      break;
    }
    case 'textMatchesFact': {
      const factVal = String(variant.facts[rule.fact] ?? '');
      const regex = new RegExp(factVal, 'i');
      if (!regex.test(response.text)) {
        notes.push('Name the date of the data.');
      }
      break;
    }
    default: {
      const _exhaustive: never = rule;
      notes.push(`Unknown rule kind: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

export function compareAttempts(
  first: AssessmentResult,
  latest: AssessmentResult
): { criterionId: string; change: CriterionChange }[] {
  return latest.criteria.map((latestCrit) => {
    const firstCrit = first.criteria.find((c) => c.criterionId === latestCrit.criterionId);
    const b = firstCrit ? firstCrit.passed : false;
    const a = latestCrit.passed;

    let change: CriterionChange;
    if (!b && a) {
      change = 'gained';
    } else if (b && a) {
      change = 'kept';
    } else if (b && !a) {
      change = 'lost';
    } else {
      change = 'still-missing';
    }

    return {
      criterionId: latestCrit.criterionId,
      change,
    };
  });
}
