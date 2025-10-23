import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { buildValidityInfo } from '../buildValidityInfo';

describe('buildValidityInfo', () => {
  it('should build validity info with all required fields', () => {
    const signed = new Date('2025-01-01T00:00:00Z');
    const validFrom = new Date('2025-01-01T00:00:00Z');
    const validUntil = new Date('2025-01-02T00:00:00Z'); // +1 day

    const result = buildValidityInfo({
      signed,
      validFrom,
      validUntil,
    });

    expect(result).toBeInstanceOf(Map);
    const signedTag = result.get('signed')!;
    const validFromTag = result.get('validFrom')!;
    const validUntilTag = result.get('validUntil')!;
    expect(signedTag).toBeInstanceOf(Tag);
    expect(signedTag.tag).toBe(0);
    expect(signedTag.value).toBe('2025-01-01T00:00:00Z');
    expect(validFromTag).toBeInstanceOf(Tag);
    expect(validFromTag.tag).toBe(0);
    expect(validFromTag.value).toBe('2025-01-01T00:00:00Z');
    expect(validUntilTag).toBeInstanceOf(Tag);
    expect(validUntilTag.tag).toBe(0);
    expect(validUntilTag.value).toBe('2025-01-02T00:00:00Z');
    expect(result.get('expectedUpdate')).toBeUndefined();
  });

  it('should build validity info with expectedUpdate when provided', () => {
    const signed = new Date('2025-01-01T00:00:00Z');
    const validFrom = new Date('2025-01-01T00:00:00Z');
    const validUntil = new Date('2025-01-02T00:00:00Z'); // +1 day
    const expectedUpdate = new Date('2025-01-01T01:00:00Z'); // +1 hour

    const result = buildValidityInfo({
      signed,
      validFrom,
      validUntil,
      expectedUpdate,
    });

    expect(result).toBeInstanceOf(Map);
    const sTag = result.get('signed')!;
    const vfTag = result.get('validFrom')!;
    const vuTag = result.get('validUntil')!;
    const euTag = result.get('expectedUpdate')!;
    expect(sTag).toBeInstanceOf(Tag);
    expect(sTag.tag).toBe(0);
    expect(sTag.value).toBe('2025-01-01T00:00:00Z');
    expect(vfTag).toBeInstanceOf(Tag);
    expect(vfTag.tag).toBe(0);
    expect(vfTag.value).toBe('2025-01-01T00:00:00Z');
    expect(vuTag).toBeInstanceOf(Tag);
    expect(vuTag.tag).toBe(0);
    expect(vuTag.value).toBe('2025-01-02T00:00:00Z');
    expect(euTag).toBeInstanceOf(Tag);
    expect(euTag.tag).toBe(0);
    expect(euTag.value).toBe('2025-01-01T01:00:00Z');
  });
});
