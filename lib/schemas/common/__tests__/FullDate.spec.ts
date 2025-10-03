import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Tag } from 'cbor-x';
import {
  createFullDateSchema,
  fullDateInvalidFormatMessage,
  fullDateInvalidTypeMessage,
} from '../FullDate';
import { requiredMessage } from '../Required';

describe('createFullDateSchema', () => {
  const target = 'ValidityInfo';
  const schema = createFullDateSchema(target);

  describe('valid cases', () => {
    it('should accept a valid full-date string and normalize it to YYYY-MM-DD', () => {
      const result = schema.parse('2024-03-20');
      expect(result).toBe('2024-03-20');
    });

    it('should accept a full datetime string with Z and return YYYY-MM-DD', () => {
      const result = schema.parse('2024-03-20T10:15:30.123Z');
      expect(result).toBe('2024-03-20');
    });

    it('should accept a full datetime string with timezone offset and return YYYY-MM-DD', () => {
      const result = schema.parse('2024-03-20T10:15:30+09:00');
      expect(result).toBe('2024-03-20');
    });

    it('should accept a CBOR Tag(1004) and return YYYY-MM-DD', () => {
      const tag = new Tag('2024-03-20', 1004);
      const result = schema.parse(tag);
      expect(result).toBe('2024-03-20');
    });

    it('should accept a Date instance and return YYYY-MM-DD', () => {
      const date = new Date('2024-03-20T10:15:30.000Z');
      const result = schema.parse(date);
      expect(result).toBe('2024-03-20');
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
              fullDateInvalidTypeMessage(target)
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
              fullDateInvalidFormatMessage(target)
            );
          }
        }
      });
    });

    it('should throw error when Date is invalid', () => {
      const badDate = new Date('invalid');
      try {
        schema.parse(badDate);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            fullDateInvalidFormatMessage(target)
          );
        }
      }
    });
  });
});
