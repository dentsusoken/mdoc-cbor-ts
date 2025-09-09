import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Tag0 } from '@/cbor/Tag0';
import {
  createDateTimeSchema,
  dateTimeInvalidTypeMessage,
  dateTimeInvalidFormatMessage,
} from '../DateTime';
import { requiredMessage } from '../Required';

describe('createDateTimeSchema', () => {
  const target = 'TestTarget';
  const schema = createDateTimeSchema(target);

  describe('valid cases', () => {
    it('should accept ISO string with Z and return normalized string', () => {
      const result = schema.parse('2024-03-20T15:30:00.123Z');
      expect(result).toBe('2024-03-20T15:30:00Z');
    });

    it('should accept ISO string with timezone offset and return normalized UTC string', () => {
      const result = schema.parse('2024-03-20T15:30:00+09:00');
      expect(result).toBe('2024-03-20T06:30:00Z');
    });

    it('should accept Tag0 instance and return its value', () => {
      const tag = new Tag0('2024-03-20T15:30:00.123Z');
      const result = schema.parse(tag);
      expect(result).toBe('2024-03-20T15:30:00Z');
    });

    it('should accept a Date instance and normalize to YYYY-MM-DDTHH:MM:SSZ', () => {
      const input = new Date('2024-03-20T15:30:00.123Z');
      // Using toISOString and trimming ms to reflect internal normalization
      const expected = '2024-03-20T15:30:00Z';
      const result = schema.parse(input);
      expect(result).toBe(expected);
    });
  });

  describe('invalid cases', () => {
    it('should throw required error for undefined', () => {
      try {
        schema.parse(undefined);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(requiredMessage(target));
        }
      }
    });

    it('should throw required error for null', () => {
      try {
        schema.parse(null);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(requiredMessage(target));
        }
      }
    });

    const wrongTypeCases: Array<{ name: string; value: unknown }> = [
      { name: 'number', value: 123 },
      { name: 'boolean', value: true },
      { name: 'object', value: {} },
    ];

    wrongTypeCases.forEach(({ name, value }) => {
      it(`invalid type: ${name}`, () => {
        try {
          schema.parse(value);
          throw new Error('Expected error');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          if (error instanceof z.ZodError) {
            expect(error.issues[0].message).toBe(
              dateTimeInvalidTypeMessage(target)
            );
          }
        }
      });
    });

    const invalidFormatCases: Array<{ name: string; value: string }> = [
      { name: 'empty string', value: '' },
      { name: 'non-date string', value: 'invalid-date' },
    ];

    invalidFormatCases.forEach(({ name, value }) => {
      it(`invalid format: ${name}`, () => {
        try {
          schema.parse(value);
          throw new Error('Expected error');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          if (error instanceof z.ZodError) {
            expect(error.issues[0].message).toBe(
              dateTimeInvalidFormatMessage(target)
            );
          }
        }
      });
    });

    it('should throw when Date.toISOString throws', () => {
      const badDate = new Date('invalid');
      // Date.toISOString will throw for invalid Date
      try {
        // simulate user passing a Date indirectly (schema expects string or Tag0)
        schema.parse(badDate);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            dateTimeInvalidFormatMessage(target)
          );
        }
      }
    });
  });
});
