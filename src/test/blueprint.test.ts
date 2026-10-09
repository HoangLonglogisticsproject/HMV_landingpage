import { describe, expect, it } from 'vitest';
import { buildBlueprint } from '@/lib/world2';

const base = { market: 'EU', season: '', documents: '' };
describe('Supply chain blueprint', () => {
  it('adds cold-chain handoffs for fresh fruit', () => {
    expect(buildBlueprint({ ...base, product: 'passion-fruit', format: 'Fresh' }, 'en')).toContain('Cold-chain handoffs');
  });
  it('uses a partner processing route for processed formats, without cold chain', () => {
    const out = buildBlueprint({ ...base, product: 'tapioca', format: 'Processed' }, 'en');
    expect(out).toContain('Partner processing route');
    expect(out).not.toContain('Cold-chain handoffs');
  });
  it('always starts from buyer requirement and ends with export', () => {
    const out = buildBlueprint({ ...base, product: 'spices', format: 'To be discussed' }, 'en');
    expect(out[0]).toBe('Requirement & specification review');
    expect(out.at(-1)).toBe('Export & delivery coordination');
  });
});
