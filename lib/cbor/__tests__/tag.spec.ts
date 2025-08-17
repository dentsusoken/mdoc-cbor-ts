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

  it('should decode raw Tag24("hello") binary into Tag instance (without using Tag class on encode)', () => {
    // Tag 24 (embedded CBOR data item) wrapping the CBOR for text string "hello"
    // Inner CBOR for "hello": 0x65 68 65 6c 6c 6f
    // Full: d8 18 46 65 68 65 6c 6c 6f
    const raw = new Uint8Array([
      0xd8, 0x18, 0x46, 0x65, 0x68, 0x65, 0x6c, 0x6c, 0x6f,
    ]);

    const decoded = decodeCbor(raw) as Tag;
    console.log(decoded);

    expect(decoded).toBeInstanceOf(Tag);
    // cbor-x represents Tag 24 value as the raw embedded CBOR bytes when decoding from raw bytes
    expect(decoded.value).toBeInstanceOf(Uint8Array);
    expect(decoded.value).toEqual(
      new Uint8Array([0x65, 0x68, 0x65, 0x6c, 0x6c, 0x6f])
    );
  });
});
