import janCsv from '../sources/aeso/raw/pool-price-2024-01-13.csv?raw';
import mayCsv from '../sources/aeso/raw/pool-price-2024-05-16.csv?raw';
import {
  parseAesoPoolPriceCsv,
  deriveWindowFacts,
  AESO_PRICE_CAP,
  AESO_PRICE_FLOOR,
} from '../sources/aeso/parse';
import { Scenario, ChallengeVariant } from '../../types/domain';

const janParsed = parseAesoPoolPriceCsv(janCsv);
const janFacts = deriveWindowFacts(janParsed.hours, '2024-01-13', 15, 20);

const mayParsed = parseAesoPoolPriceCsv(mayCsv);
const mayFacts = deriveWindowFacts(mayParsed.hours, '2024-05-16', 10, 15);

const tableColumns = [
  { key: 'he', label: 'Hour ending' },
  { key: 'time', label: 'Alberta time' },
  { key: 'price', label: 'Pool price', unit: '$/MWh' },
  { key: 'ail', label: 'Alberta Internal Load', unit: 'MW' },
];

const janHours = janParsed.hours.filter((h) => h.he >= 15 && h.he <= 20);
const janRows = janHours.map((h) => ({
  he: `HE${h.he}`,
  time: `${h.startIso.slice(11, 16)}–${h.endIso.slice(11, 16)}`,
  price: h.priceDollarsPerMWh.toFixed(2),
  ail: h.ailMw.toLocaleString('en-CA'),
}));

const mayHours = mayParsed.hours.filter((h) => h.he >= 10 && h.he <= 15);
const mayRows = mayHours.map((h) => ({
  he: `HE${h.he}`,
  time: `${h.startIso.slice(11, 16)}–${h.endIso.slice(11, 16)}`,
  price: h.priceDollarsPerMWh.toFixed(2),
  ail: h.ailMw.toLocaleString('en-CA'),
}));

const janVariant: ChallengeVariant = {
  id: 'jan-2024-cold',
  label: 'Cold snap · Sat 13 Jan 2024, HE15–HE20',
  assumptions:
    'You joined an energy operations team this month. On a Saturday in a January cold snap, your team lead asks what the market data showed between 2 pm and 8 pm.',
  table: {
    caption: 'Observed AESO pool price and demand',
    columns: tableColumns,
    rows: janRows,
  },
  source: {
    kind: 'observed',
    name: 'AESO Historical Pool Price report',
    publisher: 'Alberta Electric System Operator (AESO)',
    url: 'http://ets.aeso.ca/ets_web/ip/Market/Reports/HistoricalPoolPriceReportServlet?beginDate=01132024&endDate=01132024&contentType=csv',
    retrievedAt: '2026-11-07',
    period: '2024-01-13, HE15–HE20',
    timeBasis: 'Hour ending (HE), Alberta clock time (MST in January, MDT in May)',
    units: ['$/MWh', 'MW'],
    limitations: `Hourly pool price and Alberta Internal Load only. No generation-by-fuel, intertie, outage or grid-alert data, so it cannot show why prices moved. The pool price is the wholesale price, not a household bill. In 2024 prices were bounded by a $${AESO_PRICE_FLOOR.toFixed(2)}/MWh floor and a $${AESO_PRICE_CAP.toFixed(2)}/MWh cap.`,
  },
  facts: {
    ...janFacts,
    dateRegex: '(January 13,? 2024|Jan\\.? 13,? 2024|13 January 2024|2024-01-13|01/13/2024)',
  },
  statements: [
    {
      id: 's1',
      text: `The pool price was at the $${AESO_PRICE_CAP.toFixed(2)}/MWh cap for ${janFacts.hoursAtCap} hours.`,
      shownByData: true,
    },
    {
      id: 's2',
      text: `Alberta Internal Load peaked at ${janFacts.peakDemandMw.toLocaleString('en-CA')} MW in HE${janFacts.peakDemandHE}.`,
      shownByData: true,
    },
    {
      id: 's3',
      text: 'A generator outage caused the high prices.',
      shownByData: false,
    },
    {
      id: 's4',
      text: 'Household electricity bills tripled that evening.',
      shownByData: false,
    },
  ],
  samples: {
    baseline: {
      inputs: {
        peakPrice: String(janFacts.peakPrice),
        peakDemandMw: '11525',
        peakDemandHE: '17',
        'statements:s1': 'shown',
        'statements:s2': 'not-shown',
        'statements:s3': 'shown',
        'statements:s4': 'not-shown',
        nextStep: 'declare-emergency',
      },
      text: 'Prices went crazy because a plant broke down. The grid was in an emergency. We should shut things off.',
    },
    revision: {
      inputs: {
        peakPrice: String(janFacts.peakPrice),
        peakDemandMw: String(janFacts.peakDemandMw),
        peakDemandHE: String(janFacts.peakDemandHE),
        'statements:s1': 'shown',
        'statements:s2': 'shown',
        'statements:s3': 'not-shown',
        'statements:s4': 'not-shown',
        nextStep: 'pull-supply-data',
      },
      text: `AESO pool price data for January 13, 2024 shows the price at the $${AESO_PRICE_CAP.toFixed(2)}/MWh cap from HE17 to HE20, while Alberta Internal Load peaked at ${janFacts.peakDemandMw.toLocaleString('en-CA')} MW in HE${janFacts.peakDemandHE}. This data does not show why prices rose. Before briefing a cause, I will pull AESO supply, generation and intertie data for the same hours.`,
    },
  },
};

const mayVariant: ChallengeVariant = {
  id: 'may-2024-spring',
  label: 'Spring midday · Thu 16 May 2024, HE10–HE15',
  assumptions:
    'On a weekday in May, your team lead asks what the market data showed between 9 am and 3 pm.',
  table: {
    caption: 'Observed AESO pool price and demand',
    columns: tableColumns,
    rows: mayRows,
  },
  source: {
    kind: 'observed',
    name: 'AESO Historical Pool Price report',
    publisher: 'Alberta Electric System Operator (AESO)',
    url: 'http://ets.aeso.ca/ets_web/ip/Market/Reports/HistoricalPoolPriceReportServlet?beginDate=05162024&endDate=05162024&contentType=csv',
    retrievedAt: '2026-11-07',
    period: '2024-05-16, HE10–HE15',
    timeBasis: 'Hour ending (HE), Alberta clock time (MST in January, MDT in May)',
    units: ['$/MWh', 'MW'],
    limitations: `Hourly pool price and Alberta Internal Load only. No generation-by-fuel, intertie, outage or grid-alert data, so it cannot show why prices moved. The pool price is the wholesale price, not a household bill. In 2024 prices were bounded by a $${AESO_PRICE_FLOOR.toFixed(2)}/MWh floor and a $${AESO_PRICE_CAP.toFixed(2)}/MWh cap.`,
  },
  facts: {
    ...mayFacts,
    dateRegex: '(May 16,? 2024|16 May 2024|2024-05-16|05/16/2024)',
  },
  statements: [
    {
      id: 's1',
      text: `The pool price fell to $${AESO_PRICE_FLOOR.toFixed(2)}/MWh for ${mayFacts.hoursAtZero} hours.`,
      shownByData: true,
    },
    {
      id: 's2',
      text: `Alberta Internal Load stayed between ${mayFacts.minDemandMw.toLocaleString('en-CA')} and ${mayFacts.peakDemandMw.toLocaleString('en-CA')} MW.`,
      shownByData: true,
    },
    {
      id: 's3',
      text: 'Solar generation caused the $0 prices.',
      shownByData: false,
    },
    {
      id: 's4',
      text: 'Large consumers were paid to use electricity.',
      shownByData: false,
    },
  ],
  samples: {
    baseline: {
      inputs: {
        peakPrice: '25.00',
        peakDemandMw: '9500',
        peakDemandHE: '11',
        'statements:s1': 'not-shown',
        'statements:s2': 'not-shown',
        'statements:s3': 'shown',
        'statements:s4': 'shown',
        nextStep: 'forecast',
      },
      text: 'Prices were super low due to solar. We predict it will stay low tomorrow.',
    },
    revision: {
      inputs: {
        peakPrice: String(mayFacts.peakPrice),
        peakDemandMw: String(mayFacts.peakDemandMw),
        peakDemandHE: String(mayFacts.peakDemandHE),
        'statements:s1': 'shown',
        'statements:s2': 'shown',
        'statements:s3': 'not-shown',
        'statements:s4': 'not-shown',
        nextStep: 'pull-supply-data',
      },
      text: `AESO pool price data for May 16, 2024 shows peak pool price of $${mayFacts.peakPrice.toFixed(2)}/MWh in HE${mayFacts.peakPriceHE}, while Alberta Internal Load reached ${mayFacts.peakDemandMw.toLocaleString('en-CA')} MW in HE${mayFacts.peakDemandHE}. Prices fell to $${AESO_PRICE_FLOOR.toFixed(2)}/MWh in HE13 and HE14, but this table does not show why. I recommend we pull AESO supply, generation and intertie data for the same hours before briefing further.`,
    },
  },
};

export const rigtorack: Scenario = {
  id: 'rigtorack',
  badge: 'RigToRack · Alberta energy',
  featured: true,
  from: 'Facilities / Industrial Shift Supervisor',
  to: 'Energy & Grid Operations Analyst',
  summary:
    "Turn years of running a 24/7 facility into a first step in Alberta's energy sector, practised on real AESO data.",
  defaultDuties: [
    'Coordinated maintenance schedules and communicated overnight equipment issues to the next shift.',
    'Monitored equipment readings and daily production KPIs for a 24/7 facility.',
    'Prioritized work orders during equipment failures with a crew of 12.',
    'Wrote incident reports for safety and compliance reviews.',
  ],
  mappings: [
    {
      id: 'rig-m1',
      sourceDuty:
        'Coordinated maintenance schedules and communicated overnight equipment issues to the next shift.',
      transferableSkill: 'Incident documentation & shift handover',
      whyItTransfers:
        'Energy operations teams hand over system conditions between shifts and log events precisely.',
      status: 'suggested',
    },
    {
      id: 'rig-m2',
      sourceDuty: 'Monitored equipment readings and daily production KPIs for a 24/7 facility.',
      transferableSkill: 'Operational KPI monitoring',
      whyItTransfers:
        'Grid and market analysts watch demand and price data hour by hour and flag unusual changes.',
      status: 'suggested',
    },
    {
      id: 'rig-m3',
      sourceDuty: 'Prioritized work orders during equipment failures with a crew of 12.',
      transferableSkill: 'Priority management under time pressure',
      whyItTransfers:
        'Unusual market or system conditions need a fast, ordered list of what to check first.',
      status: 'suggested',
    },
    {
      id: 'rig-m4',
      sourceDuty: 'Wrote incident reports for safety and compliance reviews.',
      transferableSkill: 'Evidence-based reporting',
      whyItTransfers:
        'Briefings must separate what was measured from what is only suspected.',
      status: 'suggested',
    },
  ],
  gaps: [
    {
      id: 'rig-g1',
      name: 'Evidence-based electricity-data interpretation and operational communication',
      description:
        'Interpret wholesale electricity price and demand data accurately and communicate findings without unsupported causal claims.',
      relevance: 3,
      prerequisiteFor: ['rig-g2', 'rig-g3'],
      supportedByMappingIds: ['rig-m2', 'rig-m4'],
      challengeId: 'rig-c1',
      whyItMatters:
        "Energy operations analysts are trusted when they report exactly what the data shows, say what it can't show, and point to the next piece of evidence.",
      whyThisTask:
        'You already read gauges and KPIs every shift. This task uses real AESO price and demand data so you can practise turning numbers into a briefing a team could act on.',
    },
    {
      id: 'rig-g2',
      name: 'Alberta electricity market basics (pool price, price cap, Alberta Internal Load)',
      description:
        'Understand market rules, settlement intervals, and price formation in the Alberta wholesale electricity market.',
      relevance: 3,
      prerequisiteFor: [],
      supportedByMappingIds: [],
      whyItMatters: `The pool price, its $${AESO_PRICE_FLOOR.toFixed(0)} floor and $${AESO_PRICE_CAP.toFixed(2)} cap, and AIL are the vocabulary of every Alberta market briefing.`,
    },
    {
      id: 'rig-g3',
      name: 'Time-series analysis with SQL or Python',
      description:
        'Query, clean, and analyze multi-year hourly grid and price datasets programmatically.',
      relevance: 2,
      prerequisiteFor: [],
      supportedByMappingIds: ['rig-m2'],
      whyItMatters:
        'Analysts pull months of hourly data, not one table, to compare patterns.',
    },
  ],
  challenges: [
    {
      id: 'rig-c1',
      gapId: 'rig-g1',
      title: 'Brief the team on a real Alberta electricity interval',
      roleContext: 'Junior energy operations analyst',
      prompt:
        "Your team lead wants a short briefing on this interval. Read the AESO data, record the key numbers, sort what the data shows from what it doesn't, pick a defensible next step, and write a 3–4 sentence briefing that names your source.",
      estimatedMinutes: 4,
      fields: [
        {
          kind: 'number',
          id: 'peakPrice',
          label: 'Highest pool price in this window',
          unit: '$/MWh',
        },
        {
          kind: 'number',
          id: 'peakDemandMw',
          label: 'Peak Alberta Internal Load',
          unit: 'MW',
        },
        {
          kind: 'number',
          id: 'peakDemandHE',
          label: 'Hour ending of peak load',
          unit: 'HE',
        },
        {
          kind: 'classify',
          id: 'statements',
          label: 'Which statements does this data show?',
        },
        {
          kind: 'choice',
          id: 'nextStep',
          label: 'Best next step for the team',
          options: [
            {
              id: 'pull-supply-data',
              label:
                'Pull AESO supply, generation and intertie data for the same hours, then brief what they show.',
            },
            {
              id: 'declare-emergency',
              label: 'Tell leadership the grid was in an emergency.',
            },
            {
              id: 'forecast',
              label: "Use this window to forecast tomorrow's prices.",
            },
            {
              id: 'cut-load',
              label: 'Tell facilities to shut down equipment whenever prices rise.',
            },
          ],
        },
        {
          kind: 'text',
          id: 'text',
          label: 'Your briefing (3–4 sentences)',
          rows: 5,
        },
      ],
      criteria: [
        {
          id: 'crit-r1',
          title: 'Data literacy',
          description: 'Correct values, units and hour for the key measurements.',
          rules: [
            {
              kind: 'numberMatchesFact',
              input: 'peakPrice',
              fact: 'peakPrice',
              tolerance: 0.01,
            },
            {
              kind: 'numberMatchesFact',
              input: 'peakDemandMw',
              fact: 'peakDemandMw',
              tolerance: 0.5,
            },
            {
              kind: 'numberMatchesFact',
              input: 'peakDemandHE',
              fact: 'peakDemandHE',
              tolerance: 0,
            },
            {
              kind: 'textAll',
              patterns: [
                '\\$\\s?\\d[\\d,]*(\\.\\d+)?\\s?/\\s?MWh',
                '\\d[\\d,]*\\s?MW\\b',
              ],
            },
          ],
          passFeedback:
            'Key measurements, units and peak hours are correctly recorded.',
          failFeedback:
            'Check the table for the exact peak price, load and hour ending, and include units.',
        },
        {
          id: 'crit-r2',
          title: 'Analytical reasoning',
          description:
            "Separates what the data shows from causes it can't prove.",
          rules: [
            { kind: 'statementsClassified' },
            {
              kind: 'textNone',
              patterns: [
                '\\bcaused by\\b',
                '\\bbecause of\\b',
                '\\bdue to\\b',
                '\\b(was|is) an? (grid )?emergency\\b',
              ],
            },
          ],
          passFeedback:
            'Accurately distinguishes measured observations from unsupported causes.',
          failFeedback:
            "Your answer treats a cause as fact. Hourly price and demand can't show why prices moved.",
        },
        {
          id: 'crit-r3',
          title: 'Operational communication',
          description: 'A bounded, defensible next step in plain sentences.',
          rules: [
            {
              kind: 'choiceEquals',
              input: 'nextStep',
              expected: 'pull-supply-data',
            },
            { kind: 'minWords', min: 25 },
            {
              kind: 'textNone',
              patterns: [
                '\\bcrazy\\b',
                '\\binsane\\b',
                '\\bsuper\\b',
                '\\ba lot\\b',
                '\\bstuff\\b',
                '\\bASAP\\b',
                '\\bbroke down\\b',
              ],
            },
          ],
          passFeedback:
            'Recommends a sound investigative next step in clear, professional language.',
          failFeedback:
            'Choose a bounded next step to gather missing evidence, and avoid informal language.',
        },
        {
          id: 'crit-r4',
          title: 'Source transparency',
          description:
            'Names the source, the date and the hour-ending time basis.',
          rules: [
            {
              kind: 'textAll',
              patterns: [
                '\\bAESO\\b',
                '\\b(HE\\s?\\d{1,2}|hour[- ]ending)\\b',
              ],
            },
            { kind: 'textMatchesFact', fact: 'dateRegex' },
          ],
          passFeedback:
            'Cites the AESO source, date and hour-ending convention clearly.',
          failFeedback:
            'Name your source (AESO), the date of the interval, and the hour-ending convention.',
        },
      ],
      lessons: {
        'crit-r1': {
          title: 'Quote the value, the unit and the hour',
          keyRule:
            'Read the exact number from the table and give its unit and hour ending.',
          instead: 'Prices were really high and demand was big.',
          tryThis: `Pool price reached $${janFacts.peakPrice.toFixed(2)}/MWh in HE${janFacts.peakPriceHE}; Alberta Internal Load peaked at ${janFacts.peakDemandMw.toLocaleString('en-CA')} MW in HE${janFacts.peakDemandHE}.`,
          tip: 'HE18 is the hour ending at 18:00, so 17:00–18:00 Alberta time. $/MWh is a price; MW is a rate of demand.',
          readTime: '45 sec',
        },
        'crit-r2': {
          title: "Say what the data shows, and what it doesn't",
          keyRule:
            "Hourly price and demand can't tell you why prices moved. Treat causes as questions.",
          instead: 'A plant outage caused the price spike.',
          tryThis:
            'The data shows the price at the cap for four hours; it does not show the cause.',
          tip: 'A high price is not a grid emergency, and the wholesale pool price is not a household bill.',
          readTime: '45 sec',
        },
        'crit-r3': {
          title: 'Pick a next step you can actually take',
          keyRule:
            'Choose the step that gets the missing evidence, then brief in plain sentences.',
          instead: 'Shut everything down when prices rise.',
          tryThis:
            'Pull AESO supply, generation and intertie data for the same hours before naming a cause.',
          tip: 'Analysts inform decisions. One table is not enough to order equipment shutdowns.',
          readTime: '45 sec',
        },
        'crit-r4': {
          title: 'Name your source',
          keyRule:
            'Say where the numbers came from, which day, and that times are hour ending.',
          instead: 'According to the data…',
          tryThis:
            'Source: AESO Historical Pool Price report, January 13, 2024, HE15–HE20 (Alberta time).',
          tip: 'A reader should be able to find the same numbers in one search.',
          readTime: '45 sec',
        },
      },
      variants: [janVariant, mayVariant],
    },
  ],
};
