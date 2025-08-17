import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { createTag24Schema, tag24InvalidTypeMessage } from '../Tag24';
import { createTag24 } from '@/cbor/createTag24';
import { decodeCbor, encodeCbor } from '@/cbor/codec';

describe('Tag24 schema', () => {
  describe('createTag24Schema', () => {
    describe('success', () => {
      it('validates Tag 24 with Uint8Array value', () => {
        const schema = createTag24Schema('Test');
        const tag = createTag24('hello');
        const encoded = encodeCbor(tag);
        const decoded = decodeCbor(encoded) as Tag;

        const result = schema.parse(decoded);
        expect(result).toBe(decoded);
      });
    });

    describe('rejects', () => {
      it('rejects when input is not a Tag instance', () => {
        const schema = createTag24Schema('Test');

        const parsed = schema.safeParse({});
        expect(parsed.success).toBe(false);
        if (!parsed.success) {
          expect(parsed.error.issues[0]?.message).toBe(
            tag24InvalidTypeMessage('Test')
          );
        }
      });

      it('rejects when tag is not 24', () => {
        const schema = createTag24Schema('Test');

        const parsed = schema.safeParse(new Tag(new Uint8Array([1, 2, 3]), 0));
        expect(parsed.success).toBe(false);
        if (!parsed.success) {
          expect(parsed.error.issues[0]?.message).toBe(
            tag24InvalidTypeMessage('Test')
          );
        }
      });

      it('rejects when value type mismatches (expects Uint8Array, got string)', () => {
        const schema = createTag24Schema('Test');

        const parsed = schema.safeParse(new Tag('hello', 24));
        expect(parsed.success).toBe(false);
        if (!parsed.success) {
          expect(parsed.error.issues[0]?.message).toBe(
            tag24InvalidTypeMessage('Test')
          );
        }
      });
    });
  });

  describe('tag24InvalidTypeMessage', () => {
    it('builds an informative validation message', () => {
      const msg = tag24InvalidTypeMessage('MobileSecurityObject');
      expect(msg).toBe(
        'MobileSecurityObject: Please provide a Tag 24 with value type Uint8Array.'
      );
    });
  });
});
