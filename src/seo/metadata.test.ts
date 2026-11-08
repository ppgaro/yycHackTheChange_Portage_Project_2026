import { describe, it, expect } from 'vitest';
import { buildSeoMetadata, CANONICAL_ORIGIN } from './metadata';

describe('SEO metadata builder', () => {
  it('returns canonical homepage title and description on welcome step', () => {
    const meta = buildSeoMetadata('welcome', 'rigtorack');
    expect(meta.title).toContain('Portage — Your experience counts.');
    expect(meta.canonicalUrl).toBe(`${CANONICAL_ORIGIN}/`);
    expect(meta.description).toContain('Portage finds the skills you already have');
  });

  it('builds scenario-specific title, description, and canonical URL on active steps', () => {
    const meta = buildSeoMetadata('practice', 'rigtorack');
    expect(meta.title).toContain('Practice:');
    expect(meta.title).toContain('Energy & Grid Operations Analyst');
    expect(meta.canonicalUrl).toBe(`${CANONICAL_ORIGIN}/?scenario=rigtorack`);
    expect(meta.description).toContain('Alberta');
  });

  it('falls back gracefully for custom/unknown scenario IDs', () => {
    const meta = buildSeoMetadata('intake', 'custom-unknown');
    expect(meta.title).toContain('Your experience | Portage');
    expect(meta.canonicalUrl).toBe(`${CANONICAL_ORIGIN}/`);
  });
});
