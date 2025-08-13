import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  createTextSchema,
  TEXT_INVALID_TYPE_MESSAGE_SUFFIX,
  TEXT_NON_EMPTY_MESSAGE_SUFFIX,
  TEXT_REQUIRED_MESSAGE_SUFFIX,
} from '../Text';

describe('createTextSchema', () => {
  describe('should accept valid non-empty strings (trimmed)', () => {
    const cases = [
      { name: 'plain string', input: 'abc' },
      { name: 'string with surrounding spaces', input: '  def  ' },
      { name: 'single character', input: 'x' },
    ];

    cases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const schema = createTextSchema('Target');
        const result = schema.parse(input);
        expect(typeof result).toBe('string');
        expect(result).toBe(input);
      });
    });
  });

  describe('should reject empty and whitespace-only strings with consistent message', () => {
    const cases = [
      { name: 'empty string', input: '' },
      { name: 'whitespace-only string', input: '   ' },
      { name: 'string with only tabs', input: '\t\t\t' },
      { name: 'string with only newlines', input: '\n\n' },
    ];

    cases.forEach(({ name, input }) => {
      it(`should reject ${name}`, () => {
        const schema = createTextSchema('Target');
        try {
          schema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(
            `Target: ${TEXT_NON_EMPTY_MESSAGE_SUFFIX}`
          );
        }
      });
    });
  });

  describe('should reject invalid types with consistent message', () => {
    const cases: { name: string; input: unknown }[] = [
      { name: 'number input', input: 123 },
      { name: 'boolean input', input: true },
      { name: 'null input', input: null },
      { name: 'object input', input: {} },
      { name: 'array input', input: [] },
      { name: 'undefined input', input: undefined },
    ];

    cases.forEach(({ name, input }) => {
      it(`should reject ${name}`, () => {
        const schema = createTextSchema('Target');
        try {
          schema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected =
            input === undefined
              ? `Target: ${TEXT_REQUIRED_MESSAGE_SUFFIX}`
              : `Target: ${TEXT_INVALID_TYPE_MESSAGE_SUFFIX}`;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
