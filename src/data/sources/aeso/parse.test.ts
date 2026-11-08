import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseAesoPoolPriceCsv,
  deriveWindowFacts,
} from './parse';

const raw = (f: string) => readFileSync(join(__dirname, 'raw', f), 'utf8');

describe('parseAesoPoolPriceCsv & deriveWindowFacts', () => {
  it('parses all 24 hours of 2024-01-13 with no errors', () => {
    const r = parseAesoPoolPriceCsv(raw('pool-price-2024-01-13.csv'));
    expect(r.errors).toEqual([]);
    expect(r.hours).toHaveLength(24);
    expect(r.hours.find((h) => h.he === 18)).toMatchObject({
      date: '2024-01-13',
      priceDollarsPerMWh: 999.99,
      ailMw: 11802,
      startIso: '2024-01-13T17:00:00-07:00',
      endIso: '2024-01-13T18:00:00-07:00',
    });
  });

  it('uses MDT for May', () => {
    const r = parseAesoPoolPriceCsv(raw('pool-price-2024-05-16.csv'));
    expect(r.hours.find((h) => h.he === 13)).toMatchObject({
      priceDollarsPerMWh: 0,
      ailMw: 9838,
      startIso: '2024-05-16T12:00:00-06:00',
    });
  });

  it('derives the January window facts', () => {
    const f = deriveWindowFacts(parseAesoPoolPriceCsv(raw('pool-price-2024-01-13.csv')).hours, '2024-01-13', 15, 20);
    expect(f).toMatchObject({
      peakPrice: 999.99,
      peakPriceHE: 17,
      minPrice: 590.92,
      hoursAtCap: 4,
      hoursAtZero: 0,
      peakDemandMw: 11802,
      peakDemandHE: 18,
      minDemandMw: 11268,
      demandRangeMw: 534,
    });
  });

  it('derives the May window facts', () => {
    const f = deriveWindowFacts(parseAesoPoolPriceCsv(raw('pool-price-2024-05-16.csv')).hours, '2024-05-16', 10, 15);
    expect(f).toMatchObject({
      peakPrice: 13.41,
      peakPriceHE: 10,
      minPrice: 0,
      hoursAtCap: 0,
      hoursAtZero: 2,
      peakDemandMw: 9855,
      peakDemandHE: 14,
      minDemandMw: 9710,
      demandRangeMw: 145,
    });
  });

  it('reports malformed and DST rows', () => {
    const csv =
      'Pool Price\n\nDate (HE),Price ($),30Ravg ($),AIL Demand (MW)\n"11/03/2024 02*","10.00","40.00","9000.0"\n"11/03/2024 03","abc","40.00","9000.0"\n"11/03/2024 04","10.00","40.00"\n';
    const r = parseAesoPoolPriceCsv(csv);
    expect(r.hours).toEqual([]);
    expect(r.errors).toHaveLength(3);
    expect(r.errors[0]).toMatch(/DST/);
  });

  it('throws on an incomplete window', () => {
    const hours = parseAesoPoolPriceCsv(raw('pool-price-2024-01-13.csv')).hours.filter((h) => h.he !== 16);
    expect(() => deriveWindowFacts(hours, '2024-01-13', 15, 20)).toThrow(/HE16/);
  });
});
