import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import {
  embeddedCborSchema,
  embeddedCborInvalidTagMessage,
  embeddedCborInvalidValueMessage,
} from '../EmbeddedCbor';

describe('embeddedCborSchema', () => {
  describe('valid cases', () => {
    it('accepts Buffer value for Tag(24)', () => {
      const buf = Buffer.from([1, 2, 3]);
      const tag = new Tag(buf, 24);
      const parsed = embeddedCborSchema.parse(tag);
      expect(parsed).toBeInstanceOf(Tag);
      expect(parsed.tag).toBe(24);
      // Buffer is a Uint8Array; ensure byte equality
      expect(new Uint8Array(parsed.value as Uint8Array)).toEqual(
        Uint8Array.from(buf)
      );
    });

    it('accepts empty Buffer for Tag(24)', () => {
      const buf = Buffer.from([]);
      const tag = new Tag(buf, 24);
      const parsed = embeddedCborSchema.parse(tag);
      expect(parsed).toBeInstanceOf(Tag);
      expect(parsed.tag).toBe(24);
      expect(new Uint8Array(parsed.value as Uint8Array)).toEqual(
        Uint8Array.from(buf)
      );
    });
  });

  describe('invalid cases', () => {
    it('rejects non-24 tag with correct message', () => {
      const tag = new Tag(Buffer.from([1, 2]), 99);
      try {
        embeddedCborSchema.parse(tag);
        throw new Error('Expected error');
      } catch (error) {
        const expected = embeddedCborInvalidTagMessage(99);
        console.log(expected);
        expect(error as Error).toBeInstanceOf(Error);
        expect((error as z.ZodError).issues[0].message).toBe(expected);
      }
    });

    it('rejects non-Uint8Array value with correct message', () => {
      const tag = new Tag('not-bytes', 24);
      try {
        embeddedCborSchema.parse(tag);
        throw new Error('Expected error');
      } catch (error) {
        const expected = embeddedCborInvalidValueMessage('not-bytes');

        expect((error as z.ZodError).issues[0].message).toBe(expected);
      }
    });
  });
});
