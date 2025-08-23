import { describe, expect, it } from 'vitest';
import {
  createFixedTupleLengthSchema,
  fixedTupleLengthInvalidTypeMessage,
  fixedTupleLengthTooFewMessage,
  fixedTupleLengthTooManyMessage,
} from '../FixedTupleLength';
import { z } from 'zod';
import { requiredMessage } from '../Required';

describe('createFixedTupleLengthSchema', () => {
  const TARGET = 'Tuple';
  const LENGTH = 4;
  const schema = createFixedTupleLengthSchema(TARGET, LENGTH);

  describe('should accept arrays with exactly the required length', () => {
    const cases = [
      { name: 'numbers', input: [1, 2, 3, 4] },
      { name: 'mixed types', input: [1, 'a', true, null] },
    ];

    cases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = schema.parse(input);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should reject invalid types with consistent message', () => {
    const invalidMessage = fixedTupleLengthInvalidTypeMessage(TARGET);
    const cases: { name: string; input: unknown }[] = [
      { name: 'boolean', input: true },
      { name: 'object', input: { key: 'value' } },
      { name: 'string', input: 'not-array' },
      { name: 'number', input: 123 },
    ];

    cases.forEach(({ name, input }) => {
      it(`should reject ${name}`, () => {
        try {
          schema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(invalidMessage);
        }
      });
    });
  });

  describe('should reject null/undefined with required message', () => {
    const cases: { name: string; input: unknown }[] = [
      { name: 'null', input: null },
      { name: 'undefined', input: undefined },
    ];

    cases.forEach(({ name, input }) => {
      it(`should reject ${name}`, () => {
        try {
          schema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(requiredMessage(TARGET));
        }
      });
    });
  });

  describe('should enforce exact length', () => {
    it('should reject too few elements', () => {
      const input = [1, 2, 3];
      try {
        schema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          fixedTupleLengthTooFewMessage(TARGET, LENGTH)
        );
      }
    });

    it('should reject too many elements', () => {
      const input = [1, 2, 3, 4, 5];
      try {
        schema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          fixedTupleLengthTooManyMessage(TARGET, LENGTH)
        );
      }
    });
  });
});
