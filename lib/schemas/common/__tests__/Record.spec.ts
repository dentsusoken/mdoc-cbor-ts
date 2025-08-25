import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  recordInvalidTypeMessage,
  recordEmptyMessage,
  createRecordSchema,
} from '../Record';
import { requiredMessage } from '../Required';

describe('Record', () => {
  describe('createRecordSchema (record validator)', () => {
    it('should parse a valid non-empty record', () => {
      const schema = createRecordSchema({
        target: 'Headers',
        keySchema: z.string(),
        valueSchema: z.number(),
      });

      const parsed = schema.parse({ a: 1, b: 2 });
      expect(parsed).toEqual({ a: 1, b: 2 });
    });

    it('should throw when record is empty by default', () => {
      const schema = createRecordSchema({
        target: 'Headers',
        keySchema: z.string(),
        valueSchema: z.string(),
      });

      expect(() => schema.parse({})).toThrow(recordEmptyMessage('Headers'));
    });

    it('should allow empty record when allowEmpty is true', () => {
      const schema = createRecordSchema({
        target: 'Headers',
        keySchema: z.string(),
        valueSchema: z.string(),
        allowEmpty: true,
      });

      expect(schema.parse({})).toEqual({});
    });

    it('should reject non-record types with invalid type message', () => {
      const schema = createRecordSchema({
        target: 'Headers',
        keySchema: z.string(),
        valueSchema: z.string(),
      });

      expect(() => schema.parse(new Map([['k', 'v']]))).toThrow(
        recordInvalidTypeMessage('Headers')
      );
    });

    it('should validate values using valueSchema', () => {
      const schema = createRecordSchema({
        target: 'Headers',
        keySchema: z.string(),
        valueSchema: z.number(),
      });

      expect(() => schema.parse({ a: 'x' as unknown as number })).toThrow();
    });

    it('should enforce required (reject null/undefined)', () => {
      const schema = createRecordSchema({
        target: 'Headers',
        keySchema: z.string(),
        valueSchema: z.string(),
      });

      expect(() =>
        schema.parse(null as unknown as Record<string, string>)
      ).toThrow(requiredMessage('Headers'));
      expect(() =>
        schema.parse(undefined as unknown as Record<string, string>)
      ).toThrow(requiredMessage('Headers'));
    });
  });
});
