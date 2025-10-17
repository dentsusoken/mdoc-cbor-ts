import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { createRecordSchema } from '../Record';
import { containerEmptyMessage } from '../../messages/containerEmptyMessage';
import { containerInvalidTypeMessage } from '../../messages/containerInvalidTypeMessage';
import { containerInvalidValueMessage } from '../../messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('createRecordSchema', () => {
  const TARGET = 'Data';

  describe('successful validation', () => {
    it('should parse a non-empty object when nonempty=true', () => {
      const schema = createRecordSchema({
        target: TARGET,
        keySchema: z.string(),
        valueSchema: z.number(),
        nonempty: true,
      });

      const obj = { a: 1 };
      const parsed = schema.parse(obj);
      expect(parsed).toEqual(obj);
    });
  });

  describe('non-object inputs', () => {
    const schema = createRecordSchema({
      target: TARGET,
      keySchema: z.string(),
      valueSchema: z.number(),
      nonempty: true,
    });

    const cases: Array<[string, unknown]> = [
      ['map', new Map()],
      ['array', []],
      ['string', 'hello'],
      ['number', 1],
      ['boolean', true],
      ['null', null],
      ['undefined', undefined],
    ];

    for (const [name, input] of cases) {
      it(`should reject ${name} with exact invalid type message`, () => {
        const expected = containerInvalidTypeMessage({
          target: TARGET,
          expected: 'object',
          received: getTypeName(input),
        });
        const res = schema.safeParse(input);
        expect(res.success).toBe(false);
        if (!res.success) {
          expect(res.error.issues[0].message).toBe(expected);
        }
      });
    }
  });

  describe('nonempty behavior', () => {
    it('should fail with containerEmptyMessage when nonempty=true and object is empty', () => {
      const schema = createRecordSchema({
        target: TARGET,
        keySchema: z.string(),
        valueSchema: z.number(),
        nonempty: true,
      });

      const res = schema.safeParse({});
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe(containerEmptyMessage(TARGET));
      }
    });
  });

  describe('nested key/value schemas - error messaging', () => {
    it('should include key path for invalid key', () => {
      const schema = createRecordSchema({
        target: TARGET,
        keySchema: z.number(),
        valueSchema: z.number(),
        nonempty: true,
      });

      const input = { a: 1 };
      const res = schema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        const issue = res.error.issues[0];
        expect(issue.path).toEqual(['a']);
        const expected = containerInvalidValueMessage(
          TARGET,
          issue.path,
          'Expected number, received string'
        );
        expect(issue.message).toBe(expected);
      }
    });

    it('should include value path for invalid value', () => {
      const schema = createRecordSchema({
        target: TARGET,
        keySchema: z.string(),
        valueSchema: z.number(),
        nonempty: true,
      });

      const input = { a: 'x' };
      const res = schema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        const issue = res.error.issues[0];
        expect(issue.path).toEqual(['a']);
        const expected = containerInvalidValueMessage(
          TARGET,
          issue.path,
          'Expected number, received string'
        );
        expect(issue.message).toBe(expected);
      }
    });

    it('should include nested path when value schema is another record (invalid inner value)', () => {
      const inner = createRecordSchema({
        target: 'Item',
        keySchema: z.string(),
        valueSchema: z.number(),
        nonempty: true,
      });
      const schema = createRecordSchema({
        target: TARGET,
        keySchema: z.string(),
        valueSchema: inner,
        nonempty: true,
      });

      const input = { a: { id: 'x' } };
      const res = schema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        const issue = res.error.issues[0];
        expect(issue.path).toEqual(['a', 'id']);
        const expected = containerInvalidValueMessage(
          TARGET,
          issue.path,
          'Expected number, received string'
        );
        expect(issue.message).toBe(expected);
      }
    });

    it('should include nested path when value schema is another record (invalid inner key)', () => {
      const inner = createRecordSchema({
        target: 'Item',
        keySchema: z.number(),
        valueSchema: z.number(),
        nonempty: true,
      });
      const schema = createRecordSchema({
        target: TARGET,
        keySchema: z.string(),
        valueSchema: inner,
        nonempty: true,
      });

      const input = { a: { id: 123 } } as Record<string, unknown>;
      const res = schema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        const issue = res.error.issues[0];
        expect(issue.path).toEqual(['a', 'id']);
        const expected = containerInvalidValueMessage(
          TARGET,
          issue.path,
          'Expected number, received string'
        );
        expect(issue.message).toBe(expected);
      }
    });
  });
});
