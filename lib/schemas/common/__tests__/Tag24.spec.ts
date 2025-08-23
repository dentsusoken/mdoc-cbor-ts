import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { createTag24Schema, tag24InvalidTypeMessage } from '../Tag24';
import { createTag24 } from '@/cbor/createTag24';
import { decodeCbor, encodeCbor } from '@/cbor/codec';
import { requiredMessage } from '../Required';

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
      const schema = createTag24Schema('Test');

      const cases: { name: string; input: unknown; expected: string }[] = [
        {
          name: 'null input (required)',
          input: null,
          expected: requiredMessage('Test'),
        },
        {
          name: 'undefined input (required)',
          input: undefined,
          expected: requiredMessage('Test'),
        },
        {
          name: 'not a Tag instance',
          input: {},
          expected: tag24InvalidTypeMessage('Test'),
        },
        {
          name: 'tag is not 24',
          input: new Tag(new Uint8Array([1, 2, 3]), 0),
          expected: tag24InvalidTypeMessage('Test'),
        },
        {
          name: 'value type mismatches (expects Uint8Array, got string)',
          input: new Tag('hello', 24),
          expected: tag24InvalidTypeMessage('Test'),
        },
      ];

      cases.forEach(({ name, input, expected }) => {
        it(`rejects ${name}`, () => {
          const parsed = schema.safeParse(input as never);
          expect(parsed.success).toBe(false);
          if (!parsed.success) {
            expect(parsed.error.issues[0]?.message).toBe(expected);
          }
        });
      });
    });
  });

  describe('tag24InvalidTypeMessage', () => {
    it('builds an informative validation message', () => {
      const msg = tag24InvalidTypeMessage('MobileSecurityObject');
      expect(msg).toBe(
        'MobileSecurityObject: Expected a Tag 24 with Uint8Array value, but received a different type or structure. Please provide a Tag 24 with Uint8Array value.'
      );
    });
  });
});
