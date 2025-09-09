import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  createFullDateSchema,
  fullDateInvalidFormatMessage,
  fullDateInvaliTypeMessage,
} from '../FullDate';
import { requiredMessage } from '../Required';
import { Tag1004 } from '@/cbor/Tag1004';

describe('createFullDateSchema', () => {
  const target = 'ValidityInfo';
  const schema = createFullDateSchema(target);

  describe('valid inputs', () => {
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

    it('should accept a Tag1004 instance and return its YYYY-MM-DD value', () => {
      const tag = new Tag1004('2024-03-20T10:15:30.000Z');
      const result = schema.parse(tag);
      expect(result).toBe('2024-03-20');
    });

    it('should accept a Date instance and return YYYY-MM-DD', () => {
      const date = new Date('2024-03-20T10:15:30.000Z');
      const result = schema.parse(date);
      expect(result).toBe('2024-03-20');
    });
  });

  describe('invalid format strings', () => {
    const cases = [
      { name: 'empty string', value: '' },
      { name: 'non-date string', value: 'invalid-date' },
    ];

    cases.forEach(({ name, value }) => {
      it(`invalid format: ${name}`, () => {
        try {
          schema.parse(value);
          throw new Error('Expected ZodError to be thrown');
        } catch (err) {
          const zerr = err as ZodError;
          expect(zerr.issues[0]?.message).toBe(
            fullDateInvalidFormatMessage(target)
          );
        }
      });
    });
  });

  describe('invalid types', () => {
    const cases: Array<{
      name: string;
      value: unknown;
      isRequiredError?: boolean;
    }> = [
      { name: 'number', value: 123 },
      { name: 'boolean', value: true },
      { name: 'null', value: null, isRequiredError: true },
      { name: 'undefined', value: undefined, isRequiredError: true },
    ];

    cases.forEach(({ name, value, isRequiredError }) => {
      it(`invalid type: ${name}`, () => {
        try {
          schema.parse(value);
          throw new Error('Expected ZodError to be thrown');
        } catch (err) {
          const zerr = err as ZodError;
          if (isRequiredError) {
            expect(zerr.issues[0]?.message).toBe(requiredMessage(target));
          } else {
            expect(zerr.issues[0]?.message).toBe(
              fullDateInvaliTypeMessage(target)
            );
          }
        }
      });
    });
  });

  describe('invalid Date inputs', () => {
    it('should throw error when Date is invalid', () => {
      const badDate = new Date('invalid');
      try {
        schema.parse(badDate);
        throw new Error('Expected ZodError to be thrown');
      } catch (err) {
        const zerr = err as ZodError;
        expect(zerr.issues[0]?.message).toBe(
          fullDateInvalidFormatMessage(target)
        );
      }
    });
  });
});
