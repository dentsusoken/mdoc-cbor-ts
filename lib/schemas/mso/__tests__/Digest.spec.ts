import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { digestSchema } from '../Digest';
import { BYTES_INVALID_TYPE_MESSAGE_SUFFIX } from '@/schemas/common/Bytes';

describe('Digest', () => {
  describe('valid digest values', () => {
    it('should accept Buffer (empty)', () => {
      const input = Buffer.from([]);
      const result = digestSchema.parse(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Buffer.from(result)).toEqual(input);
    });

    it('should accept Buffer (non-empty)', () => {
      const input = Buffer.from([1, 2, 3]);
      const result = digestSchema.parse(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Buffer.from(result)).toEqual(input);
    });

    it('should accept Uint8Array', () => {
      const input = new Uint8Array([1, 2, 3]);
      const result = digestSchema.parse(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toEqual(input);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const schemaMessage = `Digest: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`;
    const testCases: Array<{ name: string; input: unknown; expected: string }> =
      [
        { name: 'string', input: 'not bytes', expected: schemaMessage },
        { name: 'number', input: 123, expected: schemaMessage },
        { name: 'boolean', input: true, expected: schemaMessage },
        { name: 'null', input: null, expected: schemaMessage },
        { name: 'undefined', input: undefined, expected: schemaMessage },
        {
          name: 'plain object',
          input: { key: 'value' },
          expected: schemaMessage,
        },
        { name: 'array', input: [1, 2, 3], expected: schemaMessage },
      ];

    testCases.forEach(({ name, input, expected }) => {
      it(`should throw error for ${name}`, () => {
        try {
          digestSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
