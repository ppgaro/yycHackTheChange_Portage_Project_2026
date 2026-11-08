import { Scenario } from '../../types/domain';

export const hospitalityBi: Scenario = {
  id: 'hospitality-bi',
  badge: 'Hospitality · Business intelligence',
  featured: false,
  from: 'Hospitality Supervisor',
  to: 'Business Intelligence Analyst',
  summary:
    'Turn restaurant shift management and food-prep inventory tracking into data-driven BI anomaly briefings.',
  defaultDuties: [
    'Managed weekly staff scheduling and floor labor budgets for 18 team members',
    'Tracked nightly food prep waste logs and reconciled inventory discrepancies with head chef',
    'Analyzed peak table turnover times on Friday/Saturday shifts to reduce customer waitlist times',
    'Resolved guest service escalation tickets and trained front-of-house staff on POS system',
  ],
  mappings: [
    {
      id: 'hosp-m1',
      sourceDuty:
        'Managed weekly staff scheduling and floor labor budgets for 18 team members',
      transferableSkill: 'Resource Allocation & Labor Variance Modeling',
      whyItTransfers:
        'Translates operational rostering into capacity planning, cost-center budgeting, and labor efficiency metrics.',
      status: 'suggested',
    },
    {
      id: 'hosp-m2',
      sourceDuty:
        'Tracked nightly food prep waste logs and reconciled inventory discrepancies with head chef',
      transferableSkill:
        'Operational KPI Variance Tracking & Root Cause Analysis',
      whyItTransfers:
        'Parallels ETL anomaly detection, supply-chain metric validation, and shrink loss modeling.',
      status: 'suggested',
    },
    {
      id: 'hosp-m3',
      sourceDuty:
        'Analyzed peak table turnover times on Friday/Saturday shifts to reduce customer waitlist times',
      transferableSkill: 'Throughput Optimization & Customer Funnel Analytics',
      whyItTransfers:
        'Direct analog to customer journey funnel analysis, bottleneck diagnostics, and operational SLA tracking.',
      status: 'suggested',
    },
    {
      id: 'hosp-m4',
      sourceDuty:
        'Resolved guest service escalation tickets and trained front-of-house staff on POS system',
      transferableSkill: 'Stakeholder Feedback Triage & Systems Onboarding',
      whyItTransfers:
        'Parallels internal user requirements gathering and reporting tool change management.',
      status: 'suggested',
    },
  ],
  gaps: [
    {
      id: 'gap-bi-1',
      name: 'Evidence-based KPI communication',
      description:
        'Writing concise, quantitative briefings that separate data anomalies from root-cause hypotheses for business leadership.',
      relevance: 3,
      prerequisiteFor: ['gap-bi-2', 'gap-bi-3'],
      supportedByMappingIds: ['hosp-m2', 'hosp-m3'],
      challengeId: 'challenge-bi-kpi',
      whyItMatters:
        'Writing concise, quantitative briefings that separate data anomalies from root-cause hypotheses for business leadership.',
      whyThisTask:
        'You already track nightly waste logs and table turnover. This task lets you practice turning operational variances into an executive KPI briefing.',
    },
    {
      id: 'gap-bi-2',
      name: 'SQL Multi-Table Window Functions & Aggregations',
      description:
        'Querying relational databases to compute rolling 7-day averages and cohort retention rates.',
      relevance: 3,
      prerequisiteFor: [],
      supportedByMappingIds: [],
      whyItMatters:
        'Querying relational databases to compute rolling 7-day averages and cohort retention rates.',
    },
    {
      id: 'gap-bi-3',
      name: 'Interactive BI Dashboard Prototyping (PowerBI / Tableau)',
      description:
        'Building drill-down visual layouts that surface outliers without cluttering executive viewports.',
      relevance: 2,
      prerequisiteFor: [],
      supportedByMappingIds: ['hosp-m2'],
      whyItMatters:
        'Building drill-down visual layouts that surface outliers without cluttering executive viewports.',
    },
  ],
  challenges: [
    {
      id: 'challenge-bi-kpi',
      gapId: 'gap-bi-1',
      title: 'Stakeholder KPI Anomaly Triage',
      roleContext:
        'Junior BI Analyst presenting a 3-sentence operational flash report to the VP of Operations.',
      prompt:
        'Draft an executive summary that: (1) cites the exact metric deltas, (2) cleanly separates observed data from your working hypothesis, and (3) names a concrete next operational test or owner.',
      estimatedMinutes: 4,
      fields: [{ kind: 'text', id: 'text', label: 'Your answer', rows: 6 }],
      variants: [
        {
          id: 'weekend',
          label: 'Last weekend vs. the weekend before',
          assumptions:
            "You are a junior BI analyst. The operations manager shared last weekend's numbers next to the weekend before. A new pre-batching prep routine started on Friday. Write the brief the manager will read before Monday's huddle.",
          table: {
            caption: 'Fictional demonstration data',
            columns: [
              { key: 'metric', label: 'Metric' },
              { key: 'previous', label: 'Previous weekend' },
              { key: 'current', label: 'This weekend' },
              { key: 'change', label: 'Change' },
            ],
            rows: [
              {
                metric: 'Food sales',
                previous: '$18,400',
                current: '$18,950',
                change: '+3.0%',
              },
              {
                metric: 'Prep waste (kg)',
                previous: '41.0',
                current: '46.7',
                change: '+14%',
              },
              {
                metric: 'Table turnover (parties per table per night)',
                previous: '3.3',
                current: '3.0',
                change: '−9%',
              },
              {
                metric: 'POS order error rate',
                previous: '1.9%',
                current: '1.8%',
                change: '−0.1 pts',
              },
            ],
          },
          source: {
            kind: 'fictional',
            name: 'Fictional demonstration data',
            limitations:
              'Made-up numbers for practice. Not real business data.',
          },
          facts: {},
          samples: {
            baseline: {
              inputs: {},
              text: 'The weekend was crazy busy and waste was super bad. The kitchen cooks probably threw away a lot of food because tickets were backed up. We should try to be more careful next week.',
            },
            revision: {
              inputs: {},
              text: 'During peak weekend hours, kitchen prep waste increased by 14% while table turnover dropped by 9% against benchmark. Measured inventory logs confirm scrap volumes rose primarily between 7 PM and 9 PM, which preliminary analysis suggests stems from pre-batching during the dinner rush. I recommend conducting a targeted prep-station audit with shift leads by Wednesday to validate batch-size adjustments.',
            },
          },
        },
      ],
      criteria: [
        {
          id: 'crit-1',
          title: 'Quantified metric delta',
          description:
            'Cites specific percentage changes and direction of change.',
          rules: [
            {
              kind: 'textAll',
              patterns: [
                '\\b\\d+(\\.\\d+)?%',
                '\\b(increased?|decreased?|drop(ped)?|rose|rise|fell|fall|up|down|higher|lower|declined?|grew|reduc(ed|tion))\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Clearly cites measured metric change and magnitude.',
          failFeedback:
            'Missing concrete numeric metric delta with a change word.',
        },
        {
          id: 'crit-2',
          title: 'Evidence vs. hypothesis separation',
          description:
            'Distinguishes measured historical data from suspected root causes.',
          rules: [
            {
              kind: 'textAll',
              patterns: [
                '\\b(data shows?|measured|records? (show|indicate)|logs? (show|confirm)|reports? show|observed|tracked|confirm(s|ed)?|indicates?)\\b',
                '\\b(likely|suggests?|may|might|could|hypothes\\w*|possible|potential|preliminary|suspect\\w*|probable)\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Well-separated measured observations from working hypotheses.',
          failFeedback:
            'Fails to distinguish direct observation from root-cause hypotheses.',
        },
        {
          id: 'crit-3',
          title: 'Actionable operational recommendation',
          description:
            'Proposes a concrete next investigation and names an operational owner.',
          rules: [
            {
              kind: 'textAll',
              patterns: [
                '\\b(recommend|next step|pilot|audit|investigate|implement|assign|verify|conduct|review)\\b',
                '\\b(team|leads?|chef|supervisor|manager|kitchen|vendor|operations|inventory lead|coordinator)\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Defines an actionable next step with clear operational ownership.',
          failFeedback:
            'Missing concrete operational recommendation or owner.',
        },
        {
          id: 'crit-4',
          title: 'Precision language & analytical tone',
          description:
            'Maintains objective professional tone; eliminates informal fillers.',
          rules: [
            { kind: 'minWords', min: 20 },
            {
              kind: 'textNone',
              patterns: [
                '\\bbad week\\b',
                '\\bcrazy\\b',
                '\\bsuper\\b',
                '\\ba lot\\b',
                '\\bstuff\\b',
                '\\bhuge mess\\b',
                '\\bdisaster\\b',
                '\\btotal chaos\\b',
                '\\breally bad\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Objective, professional stakeholder tone.',
          failFeedback:
            'Contains informal or imprecise language, or is under 20 words.',
        },
      ],
      lessons: {
        'crit-1': {
          title: 'Quantifying Metric Deltas',
          readTime: '45 seconds',
          keyRule:
            'Always cite both the metric and the specific delta percentage or unit difference.',
          instead:
            'Waste went way up and table turnover was significantly slower than usual.',
          tryThis:
            'Weekend operations recorded a 14% increase in prep waste alongside a 9% reduction in table turnover rate.',
          tip: 'Compare actual vs. target baseline so stakeholders understand business severity immediately.',
        },
        'crit-2': {
          title: 'Separating Observation from Hypothesis',
          readTime: '60 seconds',
          keyRule:
            'Use explicit evidentiary tags like "Data shows X; potential root cause under review is Y".',
          instead:
            'The kitchen was careless with prep because line cooks were rushed.',
          tryThis:
            'Measured logs confirm elevated scrap weights; preliminary assessment suggests modified batch-portioning procedures during rush hours.',
          tip: 'Hypotheses invite collaborative validation; unsubstantiated claims invite defensive pushback.',
        },
        'crit-3': {
          title: 'Framing Actionable Next Steps',
          readTime: '50 seconds',
          keyRule:
            'Close every anomaly report with a testable next step and an operational partner.',
          instead: 'We need to do better next weekend.',
          tryThis:
            'I recommend cross-referencing prep-station ticket timestamps with head chef Marcus by Tuesday to isolate specific prep-batch variances.',
          tip: 'Name the stakeholder and the deliverable to turn reporting into action.',
        },
        'crit-4': {
          title: 'Analytical Tone & Precision',
          readTime: '40 seconds',
          keyRule:
            'Replace emotional descriptors with objective analytical phrasing.',
          instead:
            'It was a super crazy chaotic shift and our waste was a total disaster.',
          tryThis:
            'Operations experienced higher-than-expected station volatility, resulting in measurable variance against targeted efficiency standards.',
          tip: 'Calm, quantitative precision builds leadership trust during crisis reviews.',
        },
      },
    },
  ],
  nextSteps: [
    {
      title: 'Analytical Metric Framing & Stakeholder Triage',
      items: [
        'Practice quantified anomaly reporting on restaurant order datasets',
        'Learn to write clear hypotheses that distinguish evidence from assumption',
      ],
    },
    {
      title: 'Relational Data Modeling & SQL KPI Queries',
      items: [
        'Write aggregation queries on restaurant order datasets',
        'Compute rolling average waste ratios in SQLite or PostgreSQL',
        'Build parameterized metric views for operations dashboards',
      ],
    },
  ],
};
