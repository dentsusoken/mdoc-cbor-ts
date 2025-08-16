import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { encodeCbor, decodeCbor } from '../codec';

describe('Cbor Tag', () => {
  it('should encode and decode string', () => {
    const original = new Tag('hello', 24);

    const encoded = encodeCbor(original);
    const decoded = decodeCbor(encoded) as Tag;

    expect(decoded).toBeInstanceOf(Tag);
    expect(decoded.value).toBe('hello');
  });

  it('should encode and decode number', () => {
    const original = new Tag(123, 24);

    const encoded = encodeCbor(original);
    const decoded = decodeCbor(encoded) as Tag;

    expect(decoded).toBeInstanceOf(Tag);
    expect(decoded.value).toBe(123);
  });

  it('should encode and decode DateTime', () => {
    const original = new Tag(new Date('2025-01-01T00:00:00.123Z'), 0);

    const encoded = encodeCbor(original);
    const decoded = decodeCbor(encoded) as Date;

    expect(decoded).toBeInstanceOf(Date);
    expect(decoded).toEqual(new Date('2025-01-01T00:00:00.123Z'));
  });

  it('should encode and decode DateOnly', () => {
    const original = new Tag(new Date('2025-01-01T10:00:00.123Z'), 1004);

    const encoded = encodeCbor(original);
    const decoded = decodeCbor(encoded) as Tag;

    expect(decoded).toBeInstanceOf(Tag);
    expect(decoded.value).toEqual(new Date('2025-01-01T10:00:00.123Z'));
  });
});
