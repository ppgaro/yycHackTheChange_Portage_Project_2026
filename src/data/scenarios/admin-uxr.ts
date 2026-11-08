import { Scenario } from '../../types/domain';

export const adminUxr: Scenario = {
  id: 'admin-uxr',
  badge: 'Admin · UX research',
  featured: false,
  from: 'Administrative Assistant',
  to: 'UX Researcher',
  summary:
    'Translate patient intake and administrative auditing into neutral user research protocols.',
  defaultDuties: [
    'Scheduled and conducted patient intake interviews and synthesized appointment feedback notes',
    'Audited clinic intake paperwork and identified repeated patient bottlenecks in digital check-in forms',
    'Created standardized FAQ reference guides and onboarding packets for new patient registrations',
    'Organized multi-provider scheduling calendars and monitored daily clinic waiting room flow',
  ],
  mappings: [
    {
      id: 'map-c1',
      sourceDuty:
        'Scheduled and conducted patient intake interviews and synthesized appointment feedback notes',
      transferableSkill: 'Qualitative User Interviewing & Thematic Synthesis',
      whyItTransfers:
        'Parallels semi-structured user interviews, active listening, and thematic qualitative coding.',
      status: 'suggested',
    },
    {
      id: 'map-c2',
      sourceDuty:
        'Audited clinic intake paperwork and identified repeated patient bottlenecks in digital check-in forms',
      transferableSkill:
        'Usability Heuristic Evaluation & Form Friction Analysis',
      whyItTransfers:
        'Direct analog to cognitive walkthroughs, form field drop-off audits, and accessibility reviews.',
      status: 'suggested',
    },
    {
      id: 'map-c3',
      sourceDuty:
        'Created standardized FAQ reference guides and onboarding packets for new patient registrations',
      transferableSkill: 'Content Usability & User Mental Model Alignment',
      whyItTransfers:
        'Parallels UX writing, plain-language localization, and information architecture mapping.',
      status: 'suggested',
    },
  ],
  gaps: [
    {
      id: 'gap-uxr-1',
      name: 'Neutral, Non-Leading User Research Protocol Design',
      description:
        'Framing open-ended behavioral inquiry that eliminates presupposed sentiment and leading questions.',
      relevance: 3,
      prerequisiteFor: ['gap-uxr-2', 'gap-uxr-3'],
      supportedByMappingIds: ['map-c1', 'map-c2'],
      challengeId: 'challenge-uxr-neutral',
      whyItMatters:
        'Framing open-ended inquiry eliminates bias and produces dependable user insights.',
      whyThisTask:
        'You already conduct patient intake and organize clinic feedback. This task practices turning biased survey questions into neutral research interview prompts.',
    },
    {
      id: 'gap-uxr-2',
      name: 'Affinity Diagramming & Thematic Insight Synthesis',
      description:
        'Clustering qualitative interview quotes into actionable design opportunities with severity ratings.',
      relevance: 3,
      prerequisiteFor: [],
      supportedByMappingIds: ['map-c1'],
      whyItMatters:
        'Clustering interview feedback into actionable opportunity areas guides product decisions.',
    },
    {
      id: 'gap-uxr-3',
      name: 'Usability Benchmark Testing & System Usability Scale (SUS)',
      description:
        'Administering standardized usability metrics and task completion rate benchmarks.',
      relevance: 2,
      prerequisiteFor: [],
      supportedByMappingIds: ['map-c2'],
      whyItMatters:
        'Standardized usability metrics quantify product improvements over time.',
    },
  ],
  challenges: [
    {
      id: 'challenge-uxr-neutral',
      gapId: 'gap-uxr-1',
      title: 'Rewriting Leading Research Questions',
      roleContext:
        'Junior UX Researcher rewriting intake questions into a neutral, open-ended interview guide.',
      prompt:
        'Draft 3 neutral, non-leading research questions that: (1) remove leading adjectives ("easy", "confusing", "awesome"), (2) use open-ended prompts ("how", "walk me through"), and (3) anchor to a recent concrete behavioral episode.',
      estimatedMinutes: 4,
      fields: [{ kind: 'text', id: 'text', label: 'Your answer', rows: 6 }],
      variants: [
        {
          id: 'booking-portal-survey',
          label: 'Public booking portal survey rewrite',
          assumptions:
            'You are conducting research on a new public service booking portal. The previous draft survey asked leading questions: "Was the new booking system easy to use?", "Did you find the calendar confusing?", and "Would you recommend our awesome service?" Rewrite them into neutral inquiry.',
          table: {
            caption: 'Fictional demonstration data',
            columns: [
              { key: 'draftQuestion', label: 'Draft Question' },
              { key: 'flaw', label: 'Methodological Flaw' },
              { key: 'objective', label: 'Inquiry Objective' },
            ],
            rows: [
              {
                draftQuestion: 'Was the new booking system easy to use?',
                flaw: 'Leading adjective ("easy") biases self-report',
                objective: 'Understand navigation clarity',
              },
              {
                draftQuestion: 'Did you find the calendar confusing?',
                flaw: 'Presupposes negative confusion attribute',
                objective: 'Observe date selection behavior',
              },
              {
                draftQuestion: 'Would you recommend our awesome service?',
                flaw: 'Flattery adjective ("awesome") invalidates signal',
                objective: 'Evaluate satisfaction honestly',
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
              text: 'Was the new booking system easy and straightforward, or did you find it super confusing and awesome?',
            },
            revision: {
              inputs: {},
              text: 'Could you describe how you completed your most recent booking on the portal? Please walk me through the steps you took from selecting a provider to confirming your time slot. What happened when you navigated the confirmation page during that last appointment scheduling?',
            },
          },
        },
      ],
      criteria: [
        {
          id: 'crit-c1',
          title: 'Removes Leading Adjectives',
          description:
            'Eliminates words that presuppose emotion or quality ("easy", "confusing", "awesome").',
          rules: [
            {
              kind: 'textNone',
              patterns: [
                '\\b(easy|hard|terrible|awesome|confusing|broken|bad|great|horrible)\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Open-ended phrasing without leading adjectives.',
          failFeedback:
            'Remove leading adjectives that bias user perception (e.g. "easy", "confusing", "awesome").',
        },
        {
          id: 'crit-c2',
          title: 'Open-Ended Inquiry Framing',
          description:
            'Uses neutral open-ended starters ("how", "walk me through", "describe").',
          rules: [
            {
              kind: 'textAll',
              patterns: [
                '\\b(how|walk me through|describe|what happened when|tell me about)\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Uses open-ended inquiry prompts effectively.',
          failFeedback:
            'Include open-ended inquiry prompts like "how", "describe", or "walk me through".',
        },
        {
          id: 'crit-c3',
          title: 'Anchored to Concrete Recent Episode',
          description:
            'Asks users about their last actual experience rather than hypothetical generalizations.',
          rules: [
            {
              kind: 'textAll',
              patterns: [
                '\\b(last time|most recent|recent experience|walk through the steps|when you last|last appointment|last booking)\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Grounded in a recent concrete behavioral episode.',
          failFeedback:
            'Anchor questions to a specific past episode (e.g. "most recent booking" or "last appointment").',
        },
        {
          id: 'crit-c4',
          title: 'Precision Language & Analytical Tone',
          description:
            'Maintains rigorous, non-judgmental professional research phrasing.',
          rules: [
            { kind: 'minWords', min: 20 },
            {
              kind: 'textNone',
              patterns: [
                '\\bsuper\\b',
                '\\bcrazy\\b',
                '\\ba lot\\b',
                '\\bstuff\\b',
                '\\bdisaster\\b',
              ],
            },
          ],
          passFeedback:
            'Criterion passed: Professional UX research protocol phrasing with analytical precision.',
          failFeedback:
            'Contains informal fillers or is under 20 words. Provide full research questions.',
        },
      ],
      lessons: {
        'crit-c1': {
          title: 'Eliminating Leading Adjectives',
          readTime: '45 seconds',
          keyRule:
            'Never ask if something was "easy", "hard", or "good"—ask what happened.',
          instead:
            'Did you find our new online booking system easy and straightforward?',
          tryThis:
            'How would you describe your experience completing the booking?',
          tip: 'Let the participant provide the adjective; never supply it for them.',
        },
        'crit-c2': {
          title: 'Using Open-Ended Prompts',
          readTime: '45 seconds',
          keyRule:
            'Use open starters that invite a narrative, not a yes/no response.',
          instead: 'Did the confirmation screen make sense?',
          tryThis:
            'Walk me through what you did when you reached the confirmation screen.',
          tip: 'Open prompts uncover unexpected user behaviors that closed questions hide.',
        },
        'crit-c3': {
          title: 'Grounding in Real Past Episodes',
          readTime: '50 seconds',
          keyRule:
            'Anchor questions to the most recent actual event to avoid idealized memory.',
          instead:
            'What do you usually like to do when booking appointments?',
          tryThis:
            'Think back to the last time you booked an appointment on the site. What steps did you take?',
          tip: 'Reported habits reflect what people wish they did; episodic recall reveals reality.',
        },
        'crit-c4': {
          title: 'Neutral Analytical Phrasing',
          readTime: '40 seconds',
          keyRule:
            'Maintain an objective, curious tone without casual slang or leading emphasis.',
          instead: 'Was the portal super confusing or totally fine?',
          tryThis:
            'Please walk me through your experience using the portal for your last booking.',
          tip: 'Neutral questions make participants feel comfortable reporting difficulties.',
        },
      },
    },
  ],
  nextSteps: [
    {
      title: 'Neutral User Research Protocol Design',
      items: [
        'Practice converting survey questions into non-leading semi-structured interview guides',
        'Learn to write behavioral follow-up prompts that probe decision moments',
      ],
    },
    {
      title: 'Affinity Diagramming & Insight Synthesis',
      items: [
        'Transcribe and code qualitative user interviews',
        'Group observations into theme clusters with severity ratings',
        'Translate findings into actionable product recommendation memos',
      ],
    },
  ],
};
