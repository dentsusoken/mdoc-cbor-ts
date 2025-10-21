import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createMapSchema } from '../Map';
import { createStrictMapSchema } from '../StrictMap';
import { containerEmptyMessage } from '../../messages/containerEmptyMessage';
import { containerInvalidTypeMessage } from '../../messages/containerInvalidTypeMessage';
import { containerInvalidValueMessage } from '../../messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('createMapSchema', () => {
  const TARGET = 'Data';

  describe('successful validation', () => {
    it('should parse a non-empty map of primitives when nonempty=true', () => {
      const schema = createMapSchema({
        target: TARGET,
        keySchema: z.string(),
        valueSchema: z.number(),
        nonempty: true,
      });

      const map = new Map<string, number>([['a', 1]]);
      const result = schema.safeParse(map);
      expect(result.success).toBe(true);
    });
  });

  describe('non-Map inputs', () => {
    const schema = createMapSchema({
      target: TARGET,
      keySchema: z.string(),
      valueSchema: z.number(),
      nonempty: true,
    });

    const cases: Array<[string, unknown]> = [
      ['object', {}],
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
          expected: 'Map',
          received: getTypeName(input),
        });
        const res = schema.safeParse(input as unknown as Map<unknown, unknown>);
        expect(res.success).toBe(false);
        if (!res.success) {
          expect(res.error.issues[0].message).toBe(expected);
        }
      });
    }
  });

  describe('nonempty behavior', () => {
    it('should fail with containerEmptyMessage when nonempty=true and map is empty', () => {
      const schema = createMapSchema({
        target: TARGET,
        keySchema: z.string(),
        valueSchema: z.number(),
        nonempty: true,
      });

      const res = schema.safeParse(new Map());
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe(containerEmptyMessage(TARGET));
      }
    });
  });

  describe('nested value schemas - error messaging', () => {
    it('should include index and value in the error message', () => {
      const valueSchema = createStrictMapSchema({
        target: 'Item',
        entries: [['id', z.number()]] as const,
      });
      const schema = createMapSchema({
        target: TARGET,
        keySchema: z.string(),
        valueSchema,
        nonempty: true,
      });

      const input = new Map<string, unknown>([
        ['a', new Map<string | number, unknown>([['id', 'x']])],
      ]);
      const res = schema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        const issue = res.error.issues[0];
        expect(issue.path).toEqual([0, 'value', 'id']);
        const expected = containerInvalidValueMessage({
          target: TARGET,
          path: issue.path,
          originalMessage: 'Expected number, received string',
        });
        expect(issue.message).toBe(expected);
      }
    });

    it('should include index and key in the error message', () => {
      const valueSchema = createMapSchema({
        target: 'Item',
        keySchema: z.number(),
        valueSchema: z.number(),
        nonempty: true,
      });
      const schema = createMapSchema({
        target: TARGET,
        keySchema: z.string(),
        valueSchema,
        nonempty: true,
      });
      const input = new Map<string, unknown>([
        ['a', new Map<string | number, unknown>([['id', 123]])],
      ]);

      const res = schema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        const issue = res.error.issues[0];
        expect(issue.path).toEqual([0, 'value', 0, 'key']);
        const expected = containerInvalidValueMessage({
          target: TARGET,
          path: issue.path,
          originalMessage: 'Expected number, received string',
        });
        expect(issue.message).toBe(expected);
      }
    });
  });
});
