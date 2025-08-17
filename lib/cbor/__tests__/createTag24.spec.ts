import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { createTag24, encodeCbor, decodeCbor } from '..';

const encodeCborWithTag24 = (value: unknown): Uint8Array => {
  const buffer = encodeCbor(encodeCbor(value));
  const result = new Uint8Array(2 + buffer.length);
  result[0] = 0xd8;
  result[1] = 0x18;
  result.set(buffer, 2);
  return result;
};

describe('createTag24', () => {
  it('creates Tag24 for string matching cbor-x encoding', () => {
    const value = 'hello';
    const expected = encodeCborWithTag24(value);
    const actual = encodeCbor(createTag24(value));
    expect(actual).toEqual(expected);
  });

  it('creates Tag24 for number matching cbor-x encoding', () => {
    const value = 123;
    const expected = encodeCborWithTag24(value);
    const actual = encodeCbor(createTag24(value));
    expect(actual).toEqual(expected);
  });

  it('creates Tag24 for Map matching cbor-x encoding', () => {
    const value = new Map<string, number>([['aaa', 1]]);
    const expected = encodeCborWithTag24(value);
    const actual = encodeCbor(createTag24(value));
    expect(actual).toEqual(expected);
  });

  it('round-trips: decode outer Tag and inner value equals original', () => {
    const original = new Map<string, unknown>([['k', 'v']]);
    const bytes = encodeCbor(createTag24(original));

    const outer = decodeCbor(bytes) as Tag;
    expect(outer).toBeInstanceOf(Tag);
    expect(outer.tag).toBe(24);

    const inner = decodeCbor(outer.value as Uint8Array) as Map<string, unknown>;
    expect(inner).toEqual(original);
  });

  it('can be embedded in a Map and preserved', () => {
    const tag = createTag24('hello');
    const wrapper = new Map<string, Tag>([['bytes', tag]]);

    const encoded = encodeCbor(wrapper);
    const decoded = decodeCbor(encoded) as Map<string, Tag>;

    expect(decoded.get('bytes')).toEqual(tag);
  });
});
