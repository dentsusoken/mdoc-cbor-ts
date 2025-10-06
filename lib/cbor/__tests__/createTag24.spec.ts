import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { createTag24, encodeCbor, decodeCbor } from '..';
import { DataItem } from '@auth0/mdl';

const encodeCborWithTag24 = (value: unknown): Uint8Array => {
  const buffer = encodeCbor(encodeCbor(value, { useFloat32: 0 }));
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
    const decoded = decodeCbor(actual) as Tag;
    const dataItem = DataItem.fromData(value);
    expect(Array.from(actual)).toEqual(Array.from(expected));
    expect(Array.from(dataItem.buffer)).toEqual(
      Array.from(decoded.value as Uint8Array)
    );
  });

  it('creates Tag24 for number matching cbor-x encoding', () => {
    const value = 123;
    const expected = encodeCborWithTag24(value);
    const actual = encodeCbor(createTag24(value));
    const decoded = decodeCbor(actual) as Tag;
    const dataItem = DataItem.fromData(value);
    expect(Array.from(actual)).toEqual(Array.from(expected));
    expect(Array.from(dataItem.buffer)).toEqual(
      Array.from(decoded.value as Uint8Array)
    );
  });

  it('creates Tag24 for float matching cbor-x encoding with useFloat32: 0', () => {
    const value = 3.14;
    const expected = encodeCborWithTag24(value);
    const actual = encodeCbor(createTag24(value));
    const decoded = decodeCbor(actual) as Tag;
    const dataItem = DataItem.fromData(value);
    expect(Array.from(actual)).toEqual(Array.from(expected));
    expect(Array.from(dataItem.buffer)).toEqual(
      Array.from(decoded.value as Uint8Array)
    );
  });

  it('creates Tag24 for Map matching cbor-x encoding', () => {
    const value = new Map<string, number>([['aaa', 1]]);
    const expected = encodeCborWithTag24(value);
    const actual = encodeCbor(createTag24(value));
    const decoded = decodeCbor(actual) as Tag;
    const dataItem = DataItem.fromData(value);
    expect(Array.from(actual)).toEqual(Array.from(expected));
    expect(Array.from(dataItem.buffer)).toEqual(
      Array.from(decoded.value as Uint8Array)
    );
  });

  it('round-trips: decode outer Tag and inner value equals original', () => {
    const original = new Map<string, unknown>([['k', 'v']]);
    const bytes = encodeCbor(createTag24(original));

    const outer = decodeCbor(bytes) as Tag;
    expect(outer).toBeInstanceOf(Tag);
    expect(outer.tag).toBe(24);

    const inner = decodeCbor(outer.value as Uint8Array) as Map<string, unknown>;
    expect(inner).toEqual(original);

    // Verify compatibility with auth0/mdl DataItem
    const dataItem = DataItem.fromData(original);
    const dataItemBuffer = Array.from(dataItem.buffer);
    const outerValue = Array.from(outer.value as Uint8Array);

    expect(dataItemBuffer).toEqual(outerValue);
  });

  it('can be embedded in a Map and preserved', () => {
    const value = 'hello';
    const tag = createTag24(value);
    const wrapper = new Map<string, Tag>([['bytes', tag]]);

    const encoded = encodeCbor(wrapper);
    const decoded = decodeCbor(encoded) as Map<string, Tag>;

    expect(decoded.get('bytes')).toEqual(tag);

    // Verify compatibility with auth0/mdl DataItem
    const dataItem = DataItem.fromData(value);
    expect(Array.from(dataItem.buffer)).toEqual(
      Array.from(tag.value as Uint8Array)
    );
  });
});
