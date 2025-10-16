import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Tag } from 'cbor-x';
import {
  fullDateSchema,
  fullDateInvalidTypeMessage,
  FULL_DATE_INVALID_FORMAT_MESSAGE,
  FULL_DATE_INVALID_TAG1004_MESSAGE,
} from '../FullDate';
// No Required wrapper here; test the raw schema like DateTime

describe('fullDateSchema', () => {
  const schema = fullDateSchema;

  describe('valid cases', () => {
    it('should accept a valid full-date string and normalize it to YYYY-MM-DD', () => {
      const result = schema.parse('2024-03-20');
      expect(result).toBeInstanceOf(Tag);
      expect(result.tag).toBe(1004);
      expect(result.value).toBe('2024-03-20');
    });

    it('should accept a full datetime string with Z and return YYYY-MM-DD', () => {
      const result = schema.parse('2024-03-20T10:15:30.123Z');
      expect(result).toBeInstanceOf(Tag);
      expect(result.tag).toBe(1004);
      expect(result.value).toBe('2024-03-20');
    });

    it('should accept a full datetime string with timezone offset and return YYYY-MM-DD', () => {
      const result = schema.parse('2024-03-20T10:15:30+09:00');
      expect(result).toBeInstanceOf(Tag);
      expect(result.tag).toBe(1004);
      expect(result.value).toBe('2024-03-20');
    });

    it('should accept a CBOR Tag(1004) and return YYYY-MM-DD', () => {
      const tag = new Tag('2024-03-20', 1004);
      const result = schema.parse(tag);
      expect(result).toBeInstanceOf(Tag);
      expect(result.tag).toBe(1004);
      expect(result.value).toBe('2024-03-20');
    });

    it('should accept a Date instance and return YYYY-MM-DD', () => {
      const date = new Date('2024-03-20T10:15:30.000Z');
      const result = schema.parse(date);
      expect(result).toBeInstanceOf(Tag);
      expect(result.tag).toBe(1004);
      expect(result.value).toBe('2024-03-20');
    });
  });

  describe('invalid cases', () => {
    it('should throw type error for undefined', () => {
      try {
        schema.parse(undefined);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            fullDateInvalidTypeMessage(undefined)
          );
        }
      }
    });

    it('should throw type error for null', () => {
      try {
        schema.parse(null);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            fullDateInvalidTypeMessage(null)
          );
        }
      }
    });

    describe('invalid type', () => {
      const cases: Array<{ name: string; value: unknown }> = [
        { name: 'number', value: 123 },
        { name: 'boolean', value: true },
        { name: 'object', value: {} },
      ];

      cases.forEach(({ name, value }) => {
        it(name, () => {
          try {
            schema.parse(value);
            throw new Error('Expected error');
          } catch (error) {
            expect(error).toBeInstanceOf(z.ZodError);
            if (error instanceof z.ZodError) {
              expect(error.issues[0].message).toBe(
                fullDateInvalidTypeMessage(value)
              );
            }
          }
        });
      });
    });

    describe('invalid string format', () => {
      const cases: Array<{ name: string; value: string }> = [
        { name: 'empty string', value: '' },
        { name: 'non-date string', value: 'invalid-date' },
      ];

      cases.forEach(({ name, value }) => {
        it(name, () => {
          try {
            schema.parse(value);
            throw new Error('Expected error');
          } catch (error) {
            expect(error).toBeInstanceOf(z.ZodError);
            if (error instanceof z.ZodError) {
              expect(error.issues[0].message).toBe(
                FULL_DATE_INVALID_FORMAT_MESSAGE
              );
            }
          }
        });
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
            FULL_DATE_INVALID_FORMAT_MESSAGE
          );
        }
      }
    });

    describe('invalid Tag(1004) type', () => {
      const cases: Array<{ name: string; value: Tag }> = [
        { name: 'Tag(1) with string', value: new Tag('2024-03-20', 1) },
        { name: 'Tag(1004) with number', value: new Tag(123, 1004) },
        { name: 'Tag(1004) with boolean', value: new Tag(true, 1004) },
        { name: 'Tag(1004) with object', value: new Tag({}, 1004) },
      ];

      cases.forEach(({ name, value }) => {
        it(name, () => {
          try {
            schema.parse(value);
            throw new Error('Expected error');
          } catch (error) {
            expect(error).toBeInstanceOf(z.ZodError);
            if (error instanceof z.ZodError) {
              expect(error.issues[0].message).toBe(
                FULL_DATE_INVALID_TAG1004_MESSAGE
              );
            }
          }
        });
      });
    });
  });
});
