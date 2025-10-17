import { describe, expect, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { createArraySchema } from '../Array';
import { containerEmptyMessage } from '../../messages/containerEmptyMessage';
import { containerInvalidValueMessage } from '../../messages/containerInvalidValueMessage';
import { containerInvalidTypeMessage } from '../../messages/containerInvalidTypeMessage';
import { createStrictMapSchema } from '../StrictMap';
import { getTypeName } from '@/utils/getTypeName';

describe('createArraySchema', () => {
  const TARGET = 'Tags';

  describe('successful validation', () => {
    it('should accept non-empty arrays and preserve item types', () => {
      const itemSchema = z.string();
      const schema = createArraySchema({ target: TARGET, itemSchema });

      const result = schema.parse(['a', 'b']);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(['a', 'b']);
      expectTypeOf(result).toEqualTypeOf<string[]>();
    });
  });

  describe('non-array inputs', () => {
    const itemSchema = z.string();
    const schema = createArraySchema({ target: TARGET, itemSchema });

    const cases: Array<[string, unknown]> = [
      ['boolean', true],
      ['object', { key: 'value' }],
      ['string', 'hello'],
      ['number', 123],
      ['symbol', Symbol('s')],
      ['bigint', 1n],
      ['date', new Date()],
      ['regexp', /a/],
      ['class', new (class MyClass {})()],
      ['function', (): number => 1],
      ['map', new Map()],
      ['set', new Set()],
      ['null', null],
      ['undefined', undefined],
    ];

    for (const [name, input] of cases) {
      it(`should reject ${name} input with arrayInvalidTypeMessage`, () => {
        z.getParsedType;
        const expected = containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Array',
          received: getTypeName(input),
        });

        // parse throws
        try {
          schema.parse(input as unknown as unknown[]);
          expect.fail('Should have thrown validation error');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const issue = zodError.issues[0];
          expect(issue.path).toEqual([]);
          expect(issue.message).toBe(expected);
        }

        // safeParse returns error with same message
        const result = schema.safeParse(input as unknown as unknown[]);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(expected);
        }
      });
    }
  });

  describe('empty array handling', () => {
    it('should reject empty array by default', () => {
      const itemSchema = z.string();
      const schema = createArraySchema({
        target: TARGET,
        itemSchema,
        nonempty: true,
      });

      try {
        schema.parse([]);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(containerEmptyMessage(TARGET));
      }
    });
  });

  describe('item-level error messaging', () => {
    it('should report index-scoped errors using containerInvalidValueMessage for primitive items', () => {
      const itemSchema = z.string().min(2, { message: 'Too short' });
      const schema = createArraySchema({ target: TARGET, itemSchema });

      const result = schema.safeParse(['a', 'ok']);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues[0];
        expect(issue.path).toEqual([0]);
        expect(issue.message).toBe(
          containerInvalidValueMessage(TARGET, [0], 'Too short')
        );
      }
    });

    it('should include nested paths for StrictMap item validation errors', () => {
      const itemSchema = createStrictMapSchema({
        target: 'Item',
        entries: [
          ['id', z.number({ invalid_type_error: 'Not number' })],
        ] as const,
      });
      const schema = createArraySchema({ target: TARGET, itemSchema });

      const result = schema.safeParse([
        new Map<string | number, unknown>([['id', 1]]),
        new Map<string | number, unknown>([['id', 'x']]),
      ]);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues[0];
        expect(issue.path).toEqual([1, 'id']);
        expect(issue.message).toBe(
          containerInvalidValueMessage(TARGET, [1, 'id'], 'Not number')
        );
      }
    });

    it('should include deep nested paths for nested StrictMap item errors', () => {
      const innerSchema = createStrictMapSchema({
        target: 'Inner',
        entries: [['value', z.string()]] as const,
      });
      const outerSchema = createStrictMapSchema({
        target: 'Outer',
        entries: [['child', innerSchema]] as const,
      });
      const arraySchema = createArraySchema({
        target: TARGET,
        itemSchema: outerSchema,
      });

      const result = arraySchema.safeParse([
        new Map<string | number, unknown>([
          ['child', new Map<string | number, unknown>([['value', 123]])],
        ]),
      ]);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues[0];
        expect(issue.path).toEqual([0, 'child', 'value']);
        expect(issue.message).toBe(
          containerInvalidValueMessage(
            TARGET,
            [0, 'child', 'value'],
            'Expected string, received number'
          )
        );
      }
    });

    it('should report multiple errors with correct paths and messages', () => {
      const itemSchema = createStrictMapSchema({
        target: 'Item',
        entries: [
          ['id', z.number({ invalid_type_error: 'Not number' })],
          ['name', z.string()],
        ] as const,
      });
      const schema = createArraySchema({ target: TARGET, itemSchema });

      const result = schema.safeParse([
        new Map<string | number, unknown>([
          ['id', 'bad'],
          ['name', 123],
        ]),
        new Map<string | number, unknown>([
          ['id', 'also bad'],
          ['name', 456],
        ]),
      ]);

      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.length).toBe(4);
        // First item errors
        expect(issues[0].path).toEqual([0, 'id']);
        expect(issues[0].message).toBe(
          containerInvalidValueMessage(TARGET, [0, 'id'], 'Not number')
        );
        expect(issues[1].path).toEqual([0, 'name']);
        expect(issues[1].message).toBe(
          containerInvalidValueMessage(
            TARGET,
            [0, 'name'],
            'Expected string, received number'
          )
        );
        // Second item errors
        expect(issues[2].path).toEqual([1, 'id']);
        expect(issues[2].message).toBe(
          containerInvalidValueMessage(TARGET, [1, 'id'], 'Not number')
        );
        expect(issues[3].path).toEqual([1, 'name']);
        expect(issues[3].message).toBe(
          containerInvalidValueMessage(
            TARGET,
            [1, 'name'],
            'Expected string, received number'
          )
        );
      }
    });

    it('should report multiple errors with correct paths and messages for nested arrays', () => {
      const entrySchema = createStrictMapSchema({
        target: 'Entry',
        entries: [
          ['id', z.number({ invalid_type_error: 'Not number' })],
          ['name', z.string()],
        ] as const,
      });
      const innerArraySchema = createArraySchema({
        target: 'Items',
        itemSchema: entrySchema,
      });
      const outerArraySchema = createArraySchema({
        target: TARGET,
        itemSchema: innerArraySchema,
      });

      const result = outerArraySchema.safeParse([
        [
          new Map<string | number, unknown>([
            ['id', 'bad'],
            ['name', 123],
          ]),
        ],
        [
          new Map<string | number, unknown>([
            ['id', 'also bad'],
            ['name', 456],
          ]),
        ],
      ]);

      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.length).toBe(4);

        // First outer item (index 0), first inner item (index 0)
        expect(issues[0].path).toEqual([0, 0, 'id']);
        expect(issues[0].message).toBe(
          containerInvalidValueMessage(TARGET, [0, 0, 'id'], 'Not number')
        );
        expect(issues[1].path).toEqual([0, 0, 'name']);
        expect(issues[1].message).toBe(
          containerInvalidValueMessage(
            TARGET,
            [0, 0, 'name'],
            'Expected string, received number'
          )
        );

        // Second outer item (index 1), first inner item (index 0)
        expect(issues[2].path).toEqual([1, 0, 'id']);
        expect(issues[2].message).toBe(
          containerInvalidValueMessage(TARGET, [1, 0, 'id'], 'Not number')
        );
        expect(issues[3].path).toEqual([1, 0, 'name']);
        expect(issues[3].message).toBe(
          containerInvalidValueMessage(
            TARGET,
            [1, 0, 'name'],
            'Expected string, received number'
          )
        );
      }
    });
  });
});
