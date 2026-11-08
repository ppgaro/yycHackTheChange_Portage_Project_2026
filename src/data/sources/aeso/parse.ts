export interface AesoHour {
  date: string; /* YYYY-MM-DD */
  he: number; /* 1-24 */
  priceDollarsPerMWh: number;
  rolling30dDollarsPerMWh: number;
  ailMw: number;
  startIso: string;
  endIso: string;
}

export interface ParseResult {
  hours: AesoHour[];
  errors: string[];
}

export interface WindowFacts {
  fromHE: number;
  toHE: number;
  date: string;
  peakPrice: number;
  peakPriceHE: number;
  minPrice: number;
  hoursAtCap: number;
  hoursAtZero: number;
  peakDemandMw: number;
  peakDemandHE: number;
  minDemandMw: number;
  demandRangeMw: number;
}

export const AESO_PRICE_CAP = 999.99;
export const AESO_PRICE_FLOOR = 0;

export function albertaOffset(dateStr: string, hour: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  let utc = Date.UTC(y, m - 1, d, hour + 7);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Edmonton',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'longOffset',
  });
  let parts = fmt.formatToParts(new Date(utc));
  const edmHour = Number(parts.find((p) => p.type === 'hour')?.value);
  if (edmHour !== hour) {
    utc += (hour - edmHour) * 3600000;
    parts = fmt.formatToParts(new Date(utc));
  }
  const tz = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT-07:00';
  return tz.replace('GMT', '');
}

export function albertaIsoStart(date: string, he: number): string {
  const startHour = he - 1;
  const offset = albertaOffset(date, startHour);
  return `${date}T${String(startHour).padStart(2, '0')}:00:00${offset}`;
}

export function addOneHourIso(startIso: string): string {
  const d = new Date(startIso);
  const end = new Date(d.getTime() + 3600 * 1000);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Edmonton',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'longOffset',
  });
  const parts = fmt.formatToParts(end);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const y = get('year');
  const m = get('month');
  const day = get('day');
  const h = get('hour');
  const min = get('minute');
  const sec = get('second');
  const tz = get('timeZoneName').replace('GMT', '');
  return `${y}-${m}-${day}T${h}:${min}:${sec}${tz}`;
}

export function parseAesoPoolPriceCsv(csv: string): ParseResult {
  const lines = csv.split(/\r?\n/);
  const hours: AesoHour[] = [];
  const errors: string[] = [];

  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('Date (HE)')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    return { hours: [], errors: ['header "Date (HE)" not found'] };
  }

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;
    const rowNum = i + 1;

    let lineToSplit = rawLine;
    if (lineToSplit.startsWith('"') && lineToSplit.endsWith('"')) {
      lineToSplit = lineToSplit.slice(1, -1);
    }
    const cols = lineToSplit.split('","');
    if (cols.length !== 4) {
      errors.push(`row ${rowNum}: expected 4 columns, got ${cols.length}`);
      continue;
    }

    const [dateCell, priceCell, rollingCell, ailCell] = cols;

    if (dateCell.includes('*')) {
      errors.push(`row ${rowNum}: repeated DST hour not supported`);
      continue;
    }

    const dateParts = dateCell.trim().split(' ');
    if (dateParts.length !== 2) {
      errors.push(`row ${rowNum}: invalid date format "${dateCell}"`);
      continue;
    }

    const [mdy, heStr] = dateParts;
    const [month, day, year] = mdy.split('/');
    const he = Number(heStr);
    if (!year || !month || !day || isNaN(he) || he < 1 || he > 24) {
      errors.push(`row ${rowNum}: invalid date/he "${dateCell}"`);
      continue;
    }

    const price = Number(priceCell);
    const rolling = Number(rollingCell);
    const ail = Number(ailCell);

    if (isNaN(price) || isNaN(rolling) || isNaN(ail)) {
      errors.push(`row ${rowNum}: non-numeric value in row`);
      continue;
    }

    const dateFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const startIso = albertaIsoStart(dateFormatted, he);
    const endIso = addOneHourIso(startIso);

    hours.push({
      date: dateFormatted,
      he,
      priceDollarsPerMWh: price,
      rolling30dDollarsPerMWh: rolling,
      ailMw: ail,
      startIso,
      endIso,
    });
  }

  return { hours, errors };
}

export function deriveWindowFacts(
  hours: AesoHour[],
  date: string,
  fromHE: number,
  toHE: number
): WindowFacts {
  const windowHours: AesoHour[] = [];
  for (let he = fromHE; he <= toHE; he++) {
    const hour = hours.find((h) => h.date === date && h.he === he);
    if (!hour) {
      throw new Error(`incomplete window: missing HE${he}`);
    }
    windowHours.push(hour);
  }

  const prices = windowHours.map((h) => h.priceDollarsPerMWh);
  const peakPrice = Math.max(...prices);
  const peakPriceHE = windowHours.find((h) => h.priceDollarsPerMWh === peakPrice)!.he;
  const minPrice = Math.min(...prices);
  const hoursAtCap = windowHours.filter((h) => h.priceDollarsPerMWh >= AESO_PRICE_CAP).length;
  const hoursAtZero = windowHours.filter((h) => h.priceDollarsPerMWh === AESO_PRICE_FLOOR).length;

  const demands = windowHours.map((h) => h.ailMw);
  const peakDemandMw = Math.max(...demands);
  const peakDemandHE = windowHours.find((h) => h.ailMw === peakDemandMw)!.he;
  const minDemandMw = Math.min(...demands);
  const demandRangeMw = Math.round((peakDemandMw - minDemandMw) * 100) / 100;

  return {
    fromHE,
    toHE,
    date,
    peakPrice,
    peakPriceHE,
    minPrice,
    hoursAtCap,
    hoursAtZero,
    peakDemandMw,
    peakDemandHE,
    minDemandMw,
    demandRangeMw,
  };
}
