import { describe, expect, it } from 'vitest';
import { genId } from './genId';

describe('genId', () => {
  it('returns 24 lowercase hex chars (matches Mongo ObjectID length)', () => {
    for (let i = 0; i < 50; i++) {
      const id = genId();
      expect(id).toMatch(/^[0-9a-f]{24}$/);
    }
  });

  it('produces distinct ids on consecutive calls', () => {
    const ids = new Set(Array.from({ length: 200 }, () => genId()));
    expect(ids.size).toBe(200);
  });
});
