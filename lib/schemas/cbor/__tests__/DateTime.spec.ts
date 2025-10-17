import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Tag } from 'cbor-x';
import {
  dateTimeSchema,
  dateTimeInvalidTypeMessage,
  dateTimeInvalidFormatMessage,
  dateTimeInvalidTagMessage,
} from '../DateTime';

describe('dateTimeSchema', () => {
  const schema = dateTimeSchema;

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
    describe('invalid type', () => {
      const cases: Array<{ name: string; value: unknown }> = [
        { name: 'undefined', value: undefined },
        { name: 'null', value: null },
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
                dateTimeInvalidTypeMessage(value)
              );
            }
          }
        });
      });
    });

    describe('invalid Tag', () => {
      const cases: Array<{ name: string; value: Tag }> = [
        {
          name: 'Tag(1) with string',
          value: new Tag('2024-03-20T15:30:00Z', 1),
        },
        { name: 'Tag(0) with number', value: new Tag(123, 0) },
        { name: 'Tag(0) with boolean', value: new Tag(true, 0) },
        { name: 'Tag(0) with object', value: new Tag({}, 0) },
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
                dateTimeInvalidTagMessage(value)
              );
            }
          }
        });
      });
    });

    describe('invalid Tag(0) format', () => {
      const cases: Array<{ name: string; value: Tag }> = [
        {
          name: 'Tag(0) with invalid date string',
          value: new Tag('invalid-date', 0),
        },
        { name: 'Tag(0) with empty string', value: new Tag('', 0) },
      ];

      cases.forEach(({ name, value }) => {
        it(name, () => {
          try {
            schema.parse(value);
            throw new Error('Expected error');
          } catch (error) {
            expect(error).toBeInstanceOf(z.ZodError);
            if (error instanceof z.ZodError) {
              const invalid = value.value as string;
              expect(error.issues[0].message).toBe(
                dateTimeInvalidFormatMessage(invalid)
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
                dateTimeInvalidFormatMessage(value)
              );
            }
          }
        });
      });
    });

    describe('invalid Date instance', () => {
      const cases: Array<{ name: string; value: Date }> = [
        { name: 'Date.toISOString throws', value: new Date('invalid') },
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
                dateTimeInvalidFormatMessage(value)
              );
            }
          }
        });
      });
    });
  });
});
