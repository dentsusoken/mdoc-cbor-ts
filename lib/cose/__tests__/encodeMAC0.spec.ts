import { describe, it, expect } from 'vitest';
import { encodeMAC0 } from '../encodeMAC0';
import { decodeCbor } from '@/cbor/codec';

describe('encodeMAC0', () => {
  it('encodes a valid ToMac_structure tuple with given inputs', () => {
    const protectedHeaders = new Uint8Array([0x01, 0x02]);
    const externalAad = new Uint8Array([0x0a]);
    const payload = new Uint8Array([0xaa, 0xbb]);

    const encoded = encodeMAC0({
      protectedHeaders,
      externalAad,
      payload,
    });

    const decoded = decodeCbor(encoded) as unknown[];
    expect(Array.isArray(decoded)).toBe(true);
    expect(decoded.length).toBe(4);
    expect(decoded[0]).toBe('MAC0');
    expect(decoded[1]).toEqual(protectedHeaders);
    expect(decoded[2]).toEqual(externalAad);
    expect(decoded[3]).toEqual(payload);
  });

  it('supports empty headers and payload', () => {
    const protectedHeaders = new Uint8Array();
    const externalAad = new Uint8Array();
    const payload = new Uint8Array();

    const encoded = encodeMAC0({
      protectedHeaders,
      externalAad,
      payload,
    });

    const decoded = decodeCbor(encoded) as unknown[];
    expect(decoded[0]).toBe('MAC0');
    expect(decoded[1]).toEqual(new Uint8Array());
    expect(decoded[2]).toEqual(new Uint8Array());
    expect(decoded[3]).toEqual(new Uint8Array());
  });

  it('encodes when externalAad is undefined (runtime), leaving it empty bstr', () => {
    const protectedHeaders = new Uint8Array([0x01]);
    const payload = new Uint8Array([0x02]);

    const encoded = encodeMAC0({
      protectedHeaders,
      payload,
    });

    const decoded = decodeCbor(encoded) as unknown[];
    expect(Array.isArray(decoded)).toBe(true);
    expect(decoded.length).toBe(4);
    expect(decoded[0]).toBe('MAC0');
    expect(decoded[1]).toEqual(protectedHeaders);
    expect(decoded[2]).toEqual(new Uint8Array());
    expect(decoded[3]).toEqual(payload);
  });
});
