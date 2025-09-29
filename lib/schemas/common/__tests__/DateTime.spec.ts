import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Tag } from 'cbor-x';
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
    it('should accept ISO string with Z and return Tag(0) with normalized value', () => {
      const result = schema.parse('2024-03-20T15:30:00.123Z');
      expect(result).toBeInstanceOf(Tag);
      expect(result.tag).toBe(0);
      expect(result.value).toBe('2024-03-20T15:30:00Z');
    });

    it('should accept ISO string with timezone offset and return Tag(0) with normalized UTC value', () => {
      const result = schema.parse('2024-03-20T15:30:00+09:00');
      expect(result).toBeInstanceOf(Tag);
      expect(result.tag).toBe(0);
      expect(result.value).toBe('2024-03-20T06:30:00Z');
    });

    it('should accept CBOR Tag(0) and return Tag(0) with normalized value', () => {
      const tag = new Tag('2024-03-20T15:30:00.123Z', 0);
      const result = schema.parse(tag);
      expect(result).toBeInstanceOf(Tag);
      expect(result.tag).toBe(0);
      expect(result.value).toBe('2024-03-20T15:30:00Z');
    });

    it('should accept a Date instance and return Tag(0) with normalized value', () => {
      const input = new Date('2024-03-20T15:30:00.123Z');
      const result = schema.parse(input);
      expect(result).toBeInstanceOf(Tag);
      expect(result.tag).toBe(0);
      expect(result.value).toBe('2024-03-20T15:30:00Z');
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
