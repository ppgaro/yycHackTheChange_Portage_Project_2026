import { Scenario } from '../../types/domain';

export const retailPm: Scenario = {
  id: 'retail-pm',
  badge: 'Retail · Project coordination',
  featured: false,
  from: 'Retail Store Manager',
  to: 'Project Coordinator',
  summary:
    'Turn retail inventory and shift supervision experience into structured project coordination skills.',
  defaultDuties: [
    'Coordinated visual merchandising remodels and vendor fixture installations across 4 departments',
    'Tracked shipment delivery timelines, warehouse PO statuses, and supplier backorder escalations',
    'Led daily team huddles, communicated weekly sales targets, and logged attendance exceptions',
    'Managed store incident reports, compliance safety audits, and customer return triage',
  ],
  mappings: [
    {
      id: 'map-b1',
      sourceDuty:
        'Coordinated visual merchandising remodels and vendor fixture installations across 4 departments',
      transferableSkill: 'Cross-Functional Vendor & Milestone Coordination',
      whyItTransfers:
        'Maps directly to critical-path schedule management, contractor staging, and work-breakdown structure (WBS).',
      status: 'suggested',
    },
    {
      id: 'map-b2',
      sourceDuty:
        'Tracked shipment delivery timelines, warehouse PO statuses, and supplier backorder escalations',
      transferableSkill: 'Supply-Chain Dependency & Risk Register Management',
      whyItTransfers:
        'Parallels project dependency tracking, issue log escalation, and delivery buffer management.',
      status: 'suggested',
    },
    {
      id: 'map-b3',
      sourceDuty:
        'Led daily team huddles, communicated weekly sales targets, and logged attendance exceptions',
      transferableSkill: 'Sprint Standup Facilitation & Team Cadence Management',
      whyItTransfers:
        'Direct analog to agile standups, blocker identification, and milestone progress check-ins.',
      status: 'suggested',
    },
  ],
  gaps: [
    {
      id: 'gap-pm-1',
      name: 'Critical-Path Risk Update & Vendor Delay Escalation',
      description:
        'Writing structured milestone risk notices with schedule slippage, owners, and bounded contingency buffers.',
      relevance: 3,
      prerequisiteFor: ['gap-pm-2', 'gap-pm-3'],
      supportedByMappingIds: ['map-b1', 'map-b2'],
      challengeId: 'challenge-pm-risk',
      whyItMatters:
        'Clear milestone risk notices keep executive stakeholders aligned on critical-path delays.',
      whyThisTask:
        'You already track supplier orders and delivery timelines. This task lets you practice formal schedule-slip escalations with contingency options.',
    },
    {
      id: 'gap-pm-2',
      name: 'Jira / Asana Work-Breakdown & Gantt Roadmapping',
      description:
        'Structuring multi-team epic roadmaps, custom issue types, and dependency links.',
      relevance: 3,
      prerequisiteFor: [],
      supportedByMappingIds: [],
      whyItMatters:
        'Structuring multi-team epics and dependencies is core to coordinator workflows.',
    },
    {
      id: 'gap-pm-3',
      name: 'Project Budget & Earned Value Management (EVM)',
      description:
        'Computing planned value versus actual cost variances on contractor statements of work.',
      relevance: 2,
      prerequisiteFor: [],
      supportedByMappingIds: ['map-b2'],
      whyItMatters:
        'Tracking cost and schedule variances against statements of work ensures project financial health.',
    },
  ],
  challenges: [
    {
      id: 'challenge-pm-risk',
      gapId: 'gap-pm-1',
      title: 'Vendor Milestone Delay Escalation',
      roleContext:
        'Project Coordinator issuing a formal schedule-slip advisory to the Regional Project Director.',
      prompt:
        'Draft a 3-sentence risk escalation that: (1) states the exact 5-day schedule impact on critical milestones, (2) names an owner and immediate next resolution deadline, and (3) offers a bounded contingency fallback.',
      estimatedMinutes: 4,
      fields: [{ kind: 'text', id: 'text', label: 'Your answer', rows: 6 }],
      variants: [
        {
          id: 'supplier-delay',
          label: 'Display fixture shipment delay',
          assumptions:
            'A key fixture supplier notifies you on Wednesday that custom retail display units will arrive 5 days late, directly threatening the scheduled public store reopening next Monday.',
          table: {
            caption: 'Fictional demonstration data',
            columns: [
              { key: 'milestone', label: 'Milestone' },
              { key: 'scheduledDate', label: 'Scheduled' },
              { key: 'revisedDate', label: 'Revised' },
              { key: 'slip', label: 'Variance' },
            ],
            rows: [
              {
                milestone: 'Fixture Delivery',
                scheduledDate: 'Wednesday',
                revisedDate: 'Next Monday',
                slip: '+5 days',
              },
              {
                milestone: 'Floor Staging',
                scheduledDate: 'Thursday–Friday',
                revisedDate: 'Monday night',
                slip: '+4 days',
              },
              {
                milestone: 'Public Grand Reopening',
                scheduledDate: 'Next Monday 9 AM',
                revisedDate: 'At risk',
                slip: 'Critical',
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
              text: 'The vendor messed up and parts are late so everything is ruined. Someone needs to handle this ASAP.',
            },
            revision: {
              inputs: {},
              text: 'The supplier has confirmed a 5-day delivery delay on retail display fixtures, which places our Monday launch milestone on critical-path alert. Procurement lead Marcus is coordinating expedited air freight options with the vendor by 4:00 PM today. As an immediate contingency, the store team has prepared an interim modular shelving layout to ensure doors open on schedule Monday morning.',
            },
          },
        },
      ],
      criteria: [
        {
          id: 'crit-b1',
          title: 'Critical-Path Impact Named',
          description:
            'Explicitly states the 5-day delivery delay and milestone risk.',
          rules: [
            {
              kind: 'textAll',
              patterns: [
                '\\b(5[- ]days?|five[- ]days?)\\b',
                '\\b(delay|milestone|schedule slip|critical[- ]path|launch)\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Clearly identifies timeline impact on project milestones.',
          failFeedback:
            'Must explicitly state the 5-day delivery delay and the impacted milestone.',
        },
        {
          id: 'crit-b2',
          title: 'Owner & Deadline Assigned',
          description:
            'Names who owns the mitigation step and the time boundary.',
          rules: [
            {
              kind: 'textAll',
              patterns: [
                '\\b(coordinator|lead|contractor|supplier|team|pm|manager)\\b',
                '\\b(by\\s+[a-z0-9:]+|\\d+:\\d+|eod|tomorrow|friday|monday|end of day|today)\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Clearly defines action owner and specific target deadline.',
          failFeedback:
            'Must specify who owns the resolution and the exact target deadline.',
        },
        {
          id: 'crit-b3',
          title: 'Contingency Fallback Option',
          description:
            'Provides a realistic interim workaround or staging buffer.',
          rules: [
            {
              kind: 'textAll',
              patterns: [
                '\\b(fallback|contingency|buffer|plan b|alternative|mitigation|interim|workaround)\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Provides a realistic risk mitigation or fallback plan.',
          failFeedback:
            'Must include an actionable contingency plan or alternative workaround.',
        },
        {
          id: 'crit-b4',
          title: 'Precision Language & Blameless Tone',
          description:
            'Maintains professional composure without excuses or informal slang.',
          rules: [
            { kind: 'minWords', min: 20 },
            {
              kind: 'textNone',
              patterns: [
                '\\bmessed up\\b',
                '\\bruined\\b',
                '\\bASAP\\b',
                '\\bcrazy\\b',
                '\\bdisaster\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Professional project communication with blameless precision.',
          failFeedback:
            'Contains informal phrasing or personal blame, or is under 20 words.',
        },
      ],
      lessons: {
        'crit-b1': {
          title: 'Quantifying Schedule Slippage',
          readTime: '45 seconds',
          keyRule:
            'State the exact days of delay and the downstream milestone at risk.',
          instead: 'Fixtures are delayed and opening day is in jeopardy.',
          tryThis:
            'The fixture supplier reported a 5-day shipment delay, impacting our critical-path staging deadline for the scheduled Monday reopening.',
          tip: 'Differentiate between tasks with slack and tasks on the critical path.',
        },
        'crit-b2': {
          title: 'Assigning Clear Action Ownership',
          readTime: '45 seconds',
          keyRule:
            'Specify the exact person or role and deadline for confirmation.',
          instead: 'Someone should talk to the vendor right away.',
          tryThis:
            'Logistics lead Sarah will confirm expedited courier tracking by 3:00 PM today.',
          tip: 'Action items without owners are merely wishes.',
        },
        'crit-b3': {
          title: 'Constructing Contingency Buffers',
          readTime: '50 seconds',
          keyRule:
            'Always present an interim workaround that preserves launch feasibility.',
          instead: 'We will just have to delay everything.',
          tryThis:
            'As a contingency, we have prepared an interim modular display fallback to allow Monday opening while staging the delayed units overnight Tuesday.',
          tip: 'Leadership values problem solvers who protect core customer launch dates.',
        },
        'crit-b4': {
          title: 'Maintaining Blameless Escalation',
          readTime: '40 seconds',
          keyRule:
            'Focus on system states and remedies rather than personal blame.',
          instead: 'The vendor messed up completely and ruined our week.',
          tryThis:
            'We are actively mitigating supplier delivery variance to protect our contractual launch milestones.',
          tip: 'Professional project communication remains neutral and focused on recovery.',
        },
      },
    },
  ],
  nextSteps: [
    {
      title: 'Milestone Risk Management & Escalation',
      items: [
        'Practice structured stakeholder risk advisories on supplier delay scenarios',
        'Learn to write clear contingency options that preserve core milestones',
      ],
    },
    {
      title: 'Work Breakdown Structures & Gantt Timelines',
      items: [
        'Build a Work Breakdown Structure for multi-room venue setup',
        'Define critical path and calculate task float',
        'Configure dependency links in Jira or Asana',
      ],
    },
  ],
};
