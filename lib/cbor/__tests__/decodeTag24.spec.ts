import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { encodeCbor } from '../codec';
import { createTag24 } from '../createTag24';
import { decodeTag24 } from '../decodeTag24';

describe('decodeTag24', () => {
  describe('input: Tag', () => {
    it('decodes embedded value from Tag instance (string)', () => {
      const tag = createTag24('hello');
      const decoded = decodeTag24<string>(tag);
      expect(decoded).toBe('hello');
    });

    it('decodes embedded value from Tag instance (number)', () => {
      const tag = createTag24(42);
      const decoded = decodeTag24<number>(tag);
      expect(decoded).toBe(42);
    });

    it('decodes embedded value from Tag instance (Map)', () => {
      const original = new Map<string, unknown>([
        ['name', 'Alice'],
        ['age', 30],
      ]);
      const tag = createTag24(original);
      const decoded = decodeTag24<Map<string, unknown>>(tag);
      expect(decoded).toEqual(original);
    });

    it('throws if Tag number is not 24', () => {
      const wrongTag = new Tag(encodeCbor('bad'), 18);
      expect(() => decodeTag24(wrongTag)).toThrowError('Tag number is not 24');
    });
  });

  describe('input: Uint8Array', () => {
    it('decodes when input is Uint8Array of an encoded Tag24', () => {
      const tag = createTag24('world');
      const bytes = encodeCbor(tag);
      const decoded = decodeTag24<string>(bytes);
      expect(decoded).toBe('world');
    });

    it('throws if decoded value is not a Tag', () => {
      const notATag = encodeCbor('oops');
      expect(() => decodeTag24(notATag)).toThrowError(
        'Decoded value is not a Tag'
      );
    });
  });
});
