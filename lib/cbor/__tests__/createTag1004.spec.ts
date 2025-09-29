import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { createTag1004 } from '../createTag1004';

describe('createTag1004', () => {
  it('creates Tag(1004) with ISO full-date string (YYYY-MM-DD)', () => {
    const date = new Date('2024-03-20T15:30:45.123Z');
    const tag = createTag1004(date);
    expect(tag).toBeInstanceOf(Tag);
    expect(tag.tag).toBe(1004);
    expect(tag.value).toBe('2024-03-20');
  });

  it('normalizes arbitrary Date input to UTC full-date', () => {
    const date = new Date('2024-03-20T15:30:00+09:00');
    const tag = createTag1004(date);
    expect(tag.tag).toBe(1004);
    expect(typeof tag.value).toBe('string');
    expect(tag.value).toBe('2024-03-20');
  });
});
