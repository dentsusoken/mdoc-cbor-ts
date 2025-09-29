import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { createTag18, Tag18Content } from '../createTag18';
import { encodeCbor, decodeCbor } from '../codec';

describe('createTag18', () => {
  it('creates Tag(18) with the provided 4-tuple content', () => {
    const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]);
    const unprotectedHeaders = new Map<number, unknown>([[1, -7]]);
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const signature = new Uint8Array([0xaa, 0xbb]);

    const tag = createTag18([
      protectedHeaders,
      unprotectedHeaders,
      payload,
      signature,
    ]);

    expect(tag).toBeInstanceOf(Tag);
    expect(tag.tag).toBe(18);
    const value = tag.value as Tag18Content;
    expect(Array.isArray(value)).toBe(true);
    expect(value).toHaveLength(4);
    expect(value[0]).toEqual(protectedHeaders);
    expect(value[1]).toBeInstanceOf(Map);
    expect(value[1]).toEqual(unprotectedHeaders);
    expect(value[2]).toEqual(payload);
    expect(value[3]).toEqual(signature);
  });

  it('supports empty headers and empty payload/signature', () => {
    const protectedHeaders = new Uint8Array();
    const unprotectedHeaders = new Map<number, unknown>();
    const payload = new Uint8Array();
    const signature = new Uint8Array();

    const tag = createTag18([
      protectedHeaders,
      unprotectedHeaders,
      payload,
      signature,
    ]);

    expect(tag.tag).toBe(18);
    const value = tag.value as unknown[];
    expect(value[0]).toEqual(new Uint8Array());
    expect(value[1]).toBeInstanceOf(Map);
    expect((value[1] as Map<number, unknown>).size).toBe(0);
    expect(value[2]).toEqual(new Uint8Array());
    expect(value[3]).toEqual(new Uint8Array());
  });

  it('supports null payload (detached payload)', () => {
    const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]);
    const unprotectedHeaders = new Map<number, unknown>([[1, -7]]);
    const payload = null;
    const signature = new Uint8Array([0xaa, 0xbb]);

    const tag = createTag18([
      protectedHeaders,
      unprotectedHeaders,
      payload,
      signature,
    ]);

    expect(tag).toBeInstanceOf(Tag);
    expect(tag.tag).toBe(18);
    const value = tag.value as Tag18Content;
    expect(value[0]).toEqual(protectedHeaders);
    expect(value[1]).toEqual(unprotectedHeaders);
    expect(value[2]).toBeNull();
    expect(value[3]).toEqual(signature);
  });
  it('round-trips Tag(18) through encodeCbor/decodeCbor', () => {
    const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]);
    const unprotectedHeaders = new Map<number, unknown>([[1, -7]]);
    const payload = new Uint8Array([0x01, 0x02]);
    const signature = new Uint8Array([0xaa]);

    const tag = createTag18([
      protectedHeaders,
      unprotectedHeaders,
      payload,
      signature,
    ]);

    const encoded = encodeCbor(tag);
    const decoded = decodeCbor(encoded) as Tag;

    expect(decoded).toBeInstanceOf(Tag);
    expect(decoded.tag).toBe(18);
    const value = decoded.value as Tag18Content;
    expect(value[0]).toEqual(protectedHeaders);
    expect(value[1]).toEqual(unprotectedHeaders);
    expect(value[2]).toEqual(payload);
    expect(value[3]).toEqual(signature);
  });
});
