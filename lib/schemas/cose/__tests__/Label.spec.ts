import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { labelSchema } from '@/schemas/cose/Label';
import { valueInvalidTypeMessage } from '@/schemas/messages/valueInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('labelSchema', (): void => {
  describe('successful validation', (): void => {
    it('should accept non-empty string', (): void => {
      const input = 'alg';
      const result = labelSchema.parse(input);
      expect(result).toBe(input);
    });

    it('should accept integer number', (): void => {
      const input = 1;
      const result = labelSchema.parse(input);
      expect(result).toBe(input);
    });
  });

  describe('validation errors', (): void => {
    it('should reject empty string with min length message', (): void => {
      try {
        labelSchema.parse('');
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'String must contain at least 1 character(s)'
        );
      }
    });

    it('should reject non-integer number with integer message', (): void => {
      try {
        labelSchema.parse(1.5);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected integer, received float'
        );
      }
    });

    describe('invalid types should produce exact valueInvalidTypeMessage', (): void => {
      const expected = (v: unknown): string =>
        valueInvalidTypeMessage({
          expected: 'string or number',
          received: getTypeName(v),
        });

      const cases: Array<{ name: string; input: unknown }> = [
        { name: 'boolean', input: true },
        { name: 'null', input: null },
        { name: 'undefined', input: undefined },
        { name: 'object', input: { k: 'v' } },
        { name: 'array', input: [] },
      ];

      cases.forEach(({ name, input }): void => {
        it(`should reject ${name}`, (): void => {
          try {
            labelSchema.parse(input as never);
            throw new Error('Should have thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(z.ZodError);
            const zodError = error as z.ZodError;
            expect(zodError.issues[0].message).toBe(expected(input));
          }
        });
      });
    });
  });
});
