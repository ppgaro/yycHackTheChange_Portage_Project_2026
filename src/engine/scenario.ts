import { Scenario, Rule } from '../types/domain';

export function validateScenario(s: Scenario): string[] {
  const errors: string[] = [];
  const err = (msg: string) => {
    errors.push(`${s.id}: ${msg}`);
  };

  // 1. Ids unique within mappings, gaps, challenges
  const mappingIds = new Set<string>();
  for (const m of s.mappings) {
    if (mappingIds.has(m.id)) {
      err(`duplicate mapping id "${m.id}"`);
    }
    mappingIds.add(m.id);
    if (m.status !== 'suggested') {
      err(`mapping "${m.id}" must have status "suggested", got "${m.status}"`);
    }
  }

  const gapIds = new Set<string>();
  for (const g of s.gaps) {
    if (gapIds.has(g.id)) {
      err(`duplicate gap id "${g.id}"`);
    }
    gapIds.add(g.id);
  }

  const challengeIds = new Set<string>();
  for (const c of s.challenges) {
    if (challengeIds.has(c.id)) {
      err(`duplicate challenge id "${c.id}"`);
    }
    challengeIds.add(c.id);
  }

  // 2. Every gap.challengeId exists. Every challenge.gapId exists. A gap with a challengeId has whyThisTask.
  for (const g of s.gaps) {
    if (g.challengeId) {
      if (!challengeIds.has(g.challengeId)) {
        err(`gap "${g.id}" references nonexistent challengeId "${g.challengeId}"`);
      }
      if (!g.whyThisTask) {
        err(`gap "${g.id}" has challengeId but is missing whyThisTask`);
      }
    }
    // 3. supportedByMappingIds and prerequisiteFor reference existing ids
    for (const mId of g.supportedByMappingIds) {
      if (!mappingIds.has(mId)) {
        err(`gap "${g.id}" references nonexistent mapping id "${mId}"`);
      }
    }
    for (const pId of g.prerequisiteFor) {
      if (!gapIds.has(pId)) {
        err(`gap "${g.id}" references nonexistent prerequisite gap id "${pId}"`);
      }
    }
  }

  for (const c of s.challenges) {
    if (!gapIds.has(c.gapId)) {
      err(`challenge "${c.id}" references nonexistent gapId "${c.gapId}"`);
    }

    // 4. Each challenge has exactly 4 criteria, a lesson for each criterion, and >= 1 variant
    if (c.criteria.length !== 4) {
      err(`challenge "${c.id}" must have exactly 4 criteria, got ${c.criteria.length}`);
    }

    const critIds = new Set<string>();
    for (const crit of c.criteria) {
      if (critIds.has(crit.id)) {
        err(`challenge "${c.id}" duplicate criterion id "${crit.id}"`);
      }
      critIds.add(crit.id);

      if (!c.lessons || !c.lessons[crit.id]) {
        err(`challenge "${c.id}" missing lesson for criterion "${crit.id}"`);
      }
    }

    if (!c.variants || c.variants.length < 1) {
      err(`challenge "${c.id}" must have at least 1 variant`);
    }

    // Variant validation and statements
    const fieldIds = new Set<string>(c.fields.map((f) => f.id));
    const hasClassifyField = c.fields.some((f) => f.kind === 'classify');

    for (const v of c.variants) {
      if (v.statements) {
        const stmtIds = new Set<string>();
        for (const st of v.statements) {
          if (stmtIds.has(st.id)) {
            err(`variant "${v.id}" duplicate statement id "${st.id}"`);
          }
          stmtIds.add(st.id);
        }
      }
    }

    // Rules validation
    for (const crit of c.criteria) {
      for (const r of crit.rules) {
        validateRule(r, c, fieldIds, hasClassifyField, err);
      }
    }
  }

  return errors;
}

function checkRegex(pattern: string, err: (msg: string) => void): void {
  try {
    new RegExp(pattern, 'i');
  } catch (e) {
    err(`invalid regex pattern "${pattern}": ${(e as Error).message}`);
  }
}

function validateRule(
  r: Rule,
  c: Scenario['challenges'][number],
  fieldIds: Set<string>,
  hasClassifyField: boolean,
  err: (msg: string) => void
): void {
  switch (r.kind) {
    case 'textAll':
    case 'textAny':
    case 'textNone':
      for (const p of r.patterns) {
        checkRegex(p, err);
      }
      break;
    case 'minWords':
      break;
    case 'numberMatchesFact':
      if (!fieldIds.has(r.input)) {
        err(`rule input "${r.input}" not found in challenge "${c.id}" fields`);
      }
      for (const v of c.variants) {
        if (!(r.fact in v.facts)) {
          err(`variant "${v.id}" missing required fact "${r.fact}" for rule numberMatchesFact`);
        }
      }
      break;
    case 'choiceEquals':
      if (!fieldIds.has(r.input)) {
        err(`rule input "${r.input}" not found in challenge "${c.id}" fields`);
      }
      break;
    case 'statementsClassified':
      if (!hasClassifyField) {
        err(`rule statementsClassified requires a classify field in challenge "${c.id}"`);
      }
      for (const v of c.variants) {
        if (!v.statements || v.statements.length < 2) {
          err(`variant "${v.id}" requires at least 2 statements for statementsClassified`);
        }
      }
      break;
    case 'textMatchesFact':
      for (const v of c.variants) {
        if (!(r.fact in v.facts)) {
          err(`variant "${v.id}" missing required fact "${r.fact}" for rule textMatchesFact`);
        } else {
          checkRegex(String(v.facts[r.fact]), err);
        }
      }
      break;
    default: {
      const _exhaustive: never = r;
      err(`unhandled rule kind: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
