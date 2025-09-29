import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { createTag0 } from '../createTag0';

describe('createTag0', () => {
  it('creates Tag(0) with normalized ISO string (no milliseconds)', () => {
    const date = new Date('2024-03-20T15:30:45.123Z');
    const tag = createTag0(date);
    expect(tag).toBeInstanceOf(Tag);
    expect(tag.tag).toBe(0);
    expect(tag.value).toBe('2024-03-20T15:30:45Z');
  });

  it('normalizes arbitrary Date input to UTC Z-suffix', () => {
    const date = new Date('2024-03-20T15:30:00+09:00');
    const tag = createTag0(date);
    expect(tag.tag).toBe(0);
    expect(typeof tag.value).toBe('string');
    expect(tag.value).toBe('2024-03-20T06:30:00Z');
  });
});
