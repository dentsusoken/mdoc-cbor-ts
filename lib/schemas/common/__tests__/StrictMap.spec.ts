import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  createStrictMapSchema,
  createStrictMapBuilder,
  createUnknownStrictMapBuilder,
  type StrictMapEntries,
} from '../StrictMap';
import { mapInvalidTypeMessage } from '../Map';
import { requiredMessage } from '../Required';

describe('createStrictMapSchema', () => {
  describe('should accept valid maps and return normalized Map with defined order', () => {
    it('should parse valid map and preserve defined order (strip mode)', () => {
      const entries = [
        ['family_name', z.string()],
        ['given_name', z.string()],
        ['age', z.number()],
      ] as const satisfies StrictMapEntries;

      const schema = createStrictMapSchema({
        target: 'Person',
        entries,
      });

      // Type-safe builder with autocomplete
      const input = createStrictMapBuilder<typeof entries>()
        .set('age', 30)
        .set('family_name', 'Doe')
        .set('given_name', 'John')
        .build();

      const result = schema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);

      // Check order matches entries definition
      const keys = Array.from(result.keys());
      expect(keys).toEqual(['family_name', 'given_name', 'age']);

      expect(result.get('family_name')).toBe('Doe');
      expect(result.get('given_name')).toBe('John');
      expect(result.get('age')).toBe(30);
    });

    it('should handle optional fields correctly', () => {
      const entries = [
        ['family_name', z.string()],
        ['given_name', z.string()],
        ['middle_name', z.string().optional()],
      ] as const satisfies StrictMapEntries;

      const schema = createStrictMapSchema({
        target: 'Person',
        entries,
      });

      const input = createStrictMapBuilder<typeof entries>()
        .set('given_name', 'John')
        .set('family_name', 'Doe')
        .build();

      const result = schema.parse(input);
      expect(result.size).toBe(2);

      const keys = Array.from(result.keys());
      expect(keys).toEqual(['family_name', 'given_name']);
      expect(keys).not.toContain('middle_name');
    });

    it('should include optional field when present', () => {
      const entries = [
        ['family_name', z.string()],
        ['given_name', z.string()],
        ['middle_name', z.string().optional()],
      ] as const satisfies StrictMapEntries;

      const schema = createStrictMapSchema({
        target: 'Person',
        entries,
      });

      const input = createStrictMapBuilder<typeof entries>()
        .set('given_name', 'John')
        .set('middle_name', 'Q')
        .set('family_name', 'Doe')
        .build();

      const result = schema.parse(input);
      expect(result.size).toBe(3);
      expect(result.get('middle_name')).toBe('Q');

      const keys = Array.from(result.keys());
      expect(keys).toEqual(['family_name', 'given_name', 'middle_name']);
    });
  });

  describe('unknownKeys mode', () => {
    describe('strip mode (default)', () => {
      it('should remove unknown keys from output', () => {
        const entries = [
          ['family_name', z.string()],
          ['given_name', z.string()],
        ] as const satisfies StrictMapEntries;

        const schema = createStrictMapSchema({
          target: 'Person',
          entries,
          unknownKeys: 'strip',
        });

        const input = createUnknownStrictMapBuilder<typeof entries>()
          .set('family_name', 'Doe')
          .set('given_name', 'John')
          .setUnknown('extra_key', 'should be removed')
          .setUnknown('another_extra', 123)
          .build();

        const result = schema.parse(input);
        expect(result.size).toBe(2);

        const keys = Array.from(result.keys());
        expect(keys).toEqual(['family_name', 'given_name']);
        expect(keys).not.toContain('extra_key');
        expect(keys).not.toContain('another_extra');
      });

      it('should use strip mode by default when unknownKeys is not specified', () => {
        const entries = [
          ['family_name', z.string()],
          ['given_name', z.string()],
        ] as const satisfies StrictMapEntries;

        const schema = createStrictMapSchema({
          target: 'Person',
          entries,
        });

        const input = createUnknownStrictMapBuilder<typeof entries>()
          .set('family_name', 'Doe')
          .set('given_name', 'John')
          .setUnknown('extra_key', 'should be removed')
          .build();

        const result = schema.parse(input);
        expect(result.size).toBe(2);

        const keys = Array.from(result.keys());
        expect(keys).not.toContain('extra_key');
      });
    });

    describe('passthrough mode', () => {
      it('should include unknown keys in output', () => {
        const entries = [
          ['family_name', z.string()],
          ['given_name', z.string()],
        ] as const satisfies StrictMapEntries;

        const schema = createStrictMapSchema({
          target: 'Person',
          entries,
          unknownKeys: 'passthrough',
        });

        const input = createUnknownStrictMapBuilder<typeof entries>()
          .set('family_name', 'Doe')
          .set('given_name', 'John')
          .setUnknown('extra_key', 'kept')
          .setUnknown('another_extra', 123)
          .build();

        const result = schema.parse(input);
        expect(result.size).toBe(4);

        // Defined keys should come first in order
        const keys = Array.from(result.keys());
        expect(keys[0]).toBe('family_name');
        expect(keys[1]).toBe('given_name');
        expect(keys).toContain('extra_key');
        expect(keys).toContain('another_extra');

        // Check extra key values using the generic Map interface
        const resultMap = result as Map<string, unknown>;
        expect(resultMap.get('extra_key')).toBe('kept');
        expect(resultMap.get('another_extra')).toBe(123);
      });
    });

    describe('strict mode', () => {
      it('should throw error when unknown keys are present', () => {
        const entries = [
          ['family_name', z.string()],
          ['given_name', z.string()],
        ] as const satisfies StrictMapEntries;

        const schema = createStrictMapSchema({
          target: 'Person',
          entries,
          unknownKeys: 'strict',
        });

        const input = createUnknownStrictMapBuilder<typeof entries>()
          .set('family_name', 'Doe')
          .set('given_name', 'John')
          .setUnknown('extra_key', 'error')
          .build();

        try {
          schema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(
            'Person contains unexpected key: extra_key'
          );
        }
      });

      it('should accept when no unknown keys are present', () => {
        const entries = [
          ['family_name', z.string()],
          ['given_name', z.string()],
        ] as const satisfies StrictMapEntries;

        const schema = createStrictMapSchema({
          target: 'Person',
          entries,
          unknownKeys: 'strict',
        });

        const input = createStrictMapBuilder<typeof entries>()
          .set('family_name', 'Doe')
          .set('given_name', 'John')
          .build();

        const result = schema.parse(input);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(2);
      });
    });
  });

  describe('should reject invalid input types', () => {
    const target = 'Person';
    const schema = createStrictMapSchema({
      target,
      entries: [['name', z.string()]] as const satisfies StrictMapEntries,
    });

    const cases: { name: string; input: unknown; expected: string }[] = [
      {
        name: 'string input',
        input: 'not a map',
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'number input',
        input: 123,
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'boolean input',
        input: true,
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'null input',
        input: null,
        expected: requiredMessage(target),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMessage(target),
      },
      {
        name: 'plain object input',
        input: { name: 'John' },
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'array input',
        input: [['name', 'John']],
        expected: mapInvalidTypeMessage(target),
      },
      {
        name: 'set input',
        input: new Set(['John']),
        expected: mapInvalidTypeMessage(target),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          schema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should validate values with schemas', () => {
    it('should reject when required key is missing', () => {
      const schema = createStrictMapSchema({
        target: 'Person',
        entries: [
          ['family_name', z.string()],
          ['given_name', z.string()],
        ] as const satisfies StrictMapEntries,
      });

      const input = new Map<string, unknown>([['family_name', 'Doe']]);

      try {
        schema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe('Required');
      }
    });

    it('should reject when value does not match schema', () => {
      const schema = createStrictMapSchema({
        target: 'Person',
        entries: [
          ['family_name', z.string()],
          ['age', z.number()],
        ] as const satisfies StrictMapEntries,
      });

      const input = new Map<string, unknown>([
        ['family_name', 'Doe'],
        ['age', 'not a number'],
      ]);

      try {
        schema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Expected number, received string'
        );
      }
    });

    it('should apply schema transformations', () => {
      const schema = createStrictMapSchema({
        target: 'Data',
        entries: [
          ['value', z.string().transform((s) => s.toUpperCase())],
          ['count', z.number().transform((n) => n * 2)],
        ] as const satisfies StrictMapEntries,
      });

      const input = new Map<string, unknown>([
        ['value', 'hello'],
        ['count', 5],
      ]);

      const result = schema.parse(input);
      expect(result.get('value')).toBe('HELLO');
      expect(result.get('count')).toBe(10);
    });

    it('should validate with refined schemas', () => {
      const schema = createStrictMapSchema({
        target: 'Person',
        entries: [
          ['age', z.number().min(0).max(150)],
          ['email', z.string().email()],
        ] as const satisfies StrictMapEntries,
      });

      const validInput = new Map<string, unknown>([
        ['age', 25],
        ['email', 'test@example.com'],
      ]);

      const result = schema.parse(validInput);
      expect(result.get('age')).toBe(25);
      expect(result.get('email')).toBe('test@example.com');

      // Invalid age
      const invalidAge = new Map<string, unknown>([
        ['age', 200],
        ['email', 'test@example.com'],
      ]);

      try {
        schema.parse(invalidAge);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
      }

      // Invalid email
      const invalidEmail = new Map<string, unknown>([
        ['age', 25],
        ['email', 'not-an-email'],
      ]);

      try {
        schema.parse(invalidEmail);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
      }
    });
  });

  describe('createStrictMapBuilder - type-safe input builder', () => {
    it('should provide type-safe key autocomplete and value type checking', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number()],
      ] as const satisfies StrictMapEntries;

      const schema = createStrictMapSchema({
        target: 'Test',
        entries,
      });

      // Builder provides autocomplete for keys and type checking for values
      const input = createStrictMapBuilder<typeof entries>()
        .set('name', 'Alice') // ✓ 'name' autocompletes, accepts string
        .set('age', 25) // ✓ 'age' autocompletes, accepts number
        .build();

      const result = schema.parse(input);
      expect(result.get('name')).toBe('Alice');
      expect(result.get('age')).toBe(25);
    });

    it('should work with complex schemas', () => {
      const entries = [
        ['id', z.string()],
        ['data', z.object({ x: z.number(), y: z.number() })],
        ['tags', z.array(z.string())],
      ] as const satisfies StrictMapEntries;

      const schema = createStrictMapSchema({
        target: 'Complex',
        entries,
      });

      const input = createStrictMapBuilder<typeof entries>()
        .set('id', 'test-123')
        .set('data', { x: 10, y: 20 })
        .set('tags', ['tag1', 'tag2'])
        .build();

      const result = schema.parse(input);
      expect(result.get('id')).toBe('test-123');
      expect(result.get('data')).toEqual({ x: 10, y: 20 });
      expect(result.get('tags')).toEqual(['tag1', 'tag2']);
    });

    it('should support method chaining', () => {
      const entries = [
        ['a', z.string()],
        ['b', z.number()],
        ['c', z.boolean()],
      ] as const satisfies StrictMapEntries;

      const input = createStrictMapBuilder<typeof entries>()
        .set('a', 'test')
        .set('b', 42)
        .set('c', true)
        .build();

      expect(input.size).toBe(3);
      expect(input.get('a')).toBe('test');
      expect(input.get('b')).toBe(42);
      expect(input.get('c')).toBe(true);
    });

    it('should handle optional fields', () => {
      const entries = [
        ['required', z.string()],
        ['optional', z.number().optional()],
      ] as const satisfies StrictMapEntries;

      // Can omit optional field
      const input1 = createStrictMapBuilder<typeof entries>()
        .set('required', 'value')
        .build();

      expect(input1.size).toBe(1);

      // Or include it
      const input2 = createStrictMapBuilder<typeof entries>()
        .set('required', 'value')
        .set('optional', 123)
        .build();

      expect(input2.size).toBe(2);
      expect(input2.get('optional')).toBe(123);
    });
  });

  describe('createUnknownStrictMapBuilder - builder with unknown keys support', () => {
    it('should allow setting both known and unknown string keys', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number()],
      ] as const satisfies StrictMapEntries;

      const input = createUnknownStrictMapBuilder<typeof entries>()
        .set('name', 'Alice')
        .set('age', 25)
        .setUnknown('metadata', { custom: 'data' })
        .setUnknown('timestamp', Date.now())
        .build();

      expect(input.size).toBe(4);
      expect(input.get('name')).toBe('Alice');
      expect(input.get('age')).toBe(25);
      expect(input.get('metadata')).toEqual({ custom: 'data' });
      expect(typeof input.get('timestamp')).toBe('number');
    });

    it('should allow setting unknown number keys', () => {
      const entries = [[1, z.number()]] as const satisfies StrictMapEntries;

      const input = createUnknownStrictMapBuilder<typeof entries>()
        .set(1, -7)
        .setUnknown(5, 'iv-value')
        .setUnknown(99, 'custom-header')
        .build();

      expect(input.size).toBe(3);
      expect(input.get(1)).toBe(-7);
      expect(input.get(5)).toBe('iv-value');
      expect(input.get(99)).toBe('custom-header');
    });

    it('should support method chaining with mixed keys', () => {
      const entries = [
        ['required', z.string()],
      ] as const satisfies StrictMapEntries;

      const input = createUnknownStrictMapBuilder<typeof entries>()
        .set('required', 'value')
        .setUnknown('extra1', 'a')
        .setUnknown('extra2', 'b')
        .setUnknown(100, 'numeric')
        .build();

      expect(input.size).toBe(4);
      expect(input.get('required')).toBe('value');
      expect(input.get('extra1')).toBe('a');
      expect(input.get('extra2')).toBe('b');
      expect(input.get(100)).toBe('numeric');
    });

    it('should work with empty entries and only unknown keys', () => {
      const entries = [] as const satisfies StrictMapEntries;

      const input = createUnknownStrictMapBuilder<typeof entries>()
        .setUnknown('key1', 'value1')
        .setUnknown(42, 'value2')
        .build();

      expect(input.size).toBe(2);
      expect(input.get('key1')).toBe('value1');
      expect(input.get(42)).toBe('value2');
    });

    it('should allow overwriting keys', () => {
      const entries = [
        ['name', z.string()],
      ] as const satisfies StrictMapEntries;

      const input = createUnknownStrictMapBuilder<typeof entries>()
        .set('name', 'First')
        .setUnknown('extra', 'initial')
        .set('name', 'Second') // Overwrite known key
        .setUnknown('extra', 'updated') // Overwrite unknown key
        .build();

      expect(input.size).toBe(2);
      expect(input.get('name')).toBe('Second');
      expect(input.get('extra')).toBe('updated');
    });

    it('should restrict unknown keys to numbers only when U = number', () => {
      const entries = [
        [1, z.number()],
        [4, z.string()],
      ] as const satisfies StrictMapEntries;

      const input = createUnknownStrictMapBuilder<typeof entries, number>()
        .set(1, -7) // Known key
        .set(4, 'key-id') // Known key
        .setUnknown(5, 'iv') // Unknown number key
        .setUnknown(99, 'custom-header') // Unknown number key
        .build();

      expect(input.size).toBe(4);
      expect(input.get(1)).toBe(-7);
      expect(input.get(4)).toBe('key-id');
      expect(input.get(5)).toBe('iv');
      expect(input.get(99)).toBe('custom-header');
    });

    it('should restrict unknown keys to strings only when U = string', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number()],
      ] as const satisfies StrictMapEntries;

      const input = createUnknownStrictMapBuilder<typeof entries, string>()
        .set('name', 'Alice') // Known key
        .set('age', 30) // Known key
        .setUnknown('metadata', { info: 'data' }) // Unknown string key
        .setUnknown('timestamp', '2024-01-01') // Unknown string key
        .build();

      expect(input.size).toBe(4);
      expect(input.get('name')).toBe('Alice');
      expect(input.get('age')).toBe(30);
      expect(input.get('metadata')).toEqual({ info: 'data' });
      expect(input.get('timestamp')).toBe('2024-01-01');
    });

    it('should allow both string and number unknown keys by default', () => {
      const entries = [
        ['known', z.string()],
      ] as const satisfies StrictMapEntries;

      const input = createUnknownStrictMapBuilder<typeof entries>()
        .set('known', 'value')
        .setUnknown('str-key', 'string-unknown')
        .setUnknown(42, 'number-unknown')
        .build();

      expect(input.size).toBe(3);
      expect(input.get('known')).toBe('value');
      expect(input.get('str-key')).toBe('string-unknown');
      expect(input.get(42)).toBe('number-unknown');
    });
  });

  describe('number keys support', () => {
    it('should handle number keys (e.g., COSE header labels)', () => {
      const entries = [
        [1, z.number()], // Algorithm
        [4, z.string()], // Key ID
      ] as const satisfies StrictMapEntries;

      const schema = createStrictMapSchema({
        target: 'CoseHeaders',
        entries,
      });

      const input = createStrictMapBuilder<typeof entries>()
        .set(1, -7) // ES256
        .set(4, 'key-123')
        .build();

      const result = schema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);

      const keys = Array.from(result.keys());
      expect(keys).toEqual([1, 4]);

      expect(result.get(1)).toBe(-7);
      expect(result.get(4)).toBe('key-123');
    });

    it('should handle mixed string and number keys', () => {
      const entries = [
        [1, z.number()],
        ['custom_field', z.string()],
        [4, z.string()],
      ] as const satisfies StrictMapEntries;

      const schema = createStrictMapSchema({
        target: 'MixedHeaders',
        entries,
      });

      const input = createStrictMapBuilder<typeof entries>()
        .set(1, -8) // EdDSA
        .set('custom_field', 'value')
        .set(4, 'kid-456')
        .build();

      const result = schema.parse(input);
      expect(result.size).toBe(3);

      const keys = Array.from(result.keys());
      expect(keys).toEqual([1, 'custom_field', 4]);

      expect(result.get(1)).toBe(-8);
      expect(result.get('custom_field')).toBe('value');
      expect(result.get(4)).toBe('kid-456');
    });

    it('should handle unknown number keys with setUnknown', () => {
      const entries = [[1, z.number()]] as const satisfies StrictMapEntries;

      const schema = createStrictMapSchema({
        target: 'ExtendedHeaders',
        entries,
        unknownKeys: 'passthrough',
      });

      const input = createUnknownStrictMapBuilder<typeof entries>()
        .set(1, -7)
        .setUnknown(5, 'additional header') // IV
        .setUnknown('x-custom', 'custom value')
        .build();

      // Verify input contains all keys with correct values
      expect(input.size).toBe(3);
      expect(input.get(1)).toBe(-7);
      expect(input.get(5)).toBe('additional header');
      expect(input.get('x-custom')).toBe('custom value');

      const result = schema.parse(input);

      // Verify known key is validated and preserved
      expect(result.get(1)).toBe(-7);

      // Passthrough mode preserves all keys including unknown ones (verified by size)
      // Input had 3 keys (1 known + 2 unknown), all should be preserved
      expect(result.size).toBe(3);
    });

    it('should validate number keys in strict mode', () => {
      const entries = [
        [1, z.number()],
        [4, z.string()],
      ] as const satisfies StrictMapEntries;

      const schema = createStrictMapSchema({
        target: 'StrictHeaders',
        entries,
        unknownKeys: 'strict',
      });

      const input = createUnknownStrictMapBuilder<typeof entries>()
        .set(1, -7)
        .set(4, 'key-id')
        .setUnknown(99, 'unexpected')
        .build();

      try {
        schema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'StrictHeaders contains unexpected key: 99'
        );
      }
    });

    it('should handle optional number keys', () => {
      const entries = [
        [1, z.number()],
        [4, z.string().optional()],
      ] as const satisfies StrictMapEntries;

      const schema = createStrictMapSchema({
        target: 'OptionalHeaders',
        entries,
      });

      const input = createStrictMapBuilder<typeof entries>()
        .set(1, -35) // ES384
        .build();

      const result = schema.parse(input);
      expect(result.size).toBe(1);
      expect(result.get(1)).toBe(-35);
      expect(result.has(4)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty entries array', () => {
      const schema = createStrictMapSchema({
        target: 'Empty',
        entries: [] as const,
      });

      const input = new Map();
      const result = schema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should handle single entry', () => {
      const schema = createStrictMapSchema({
        target: 'Single',
        entries: [['key', z.string()]] as const satisfies StrictMapEntries,
      });

      const input = new Map<string, unknown>([['key', 'value']]);
      const result = schema.parse(input);
      expect(result.size).toBe(1);
      expect(result.get('key')).toBe('value');
    });

    it('should handle complex value types', () => {
      const schema = createStrictMapSchema({
        target: 'Complex',
        entries: [
          ['array', z.array(z.number())],
          ['nested', z.object({ a: z.string(), b: z.number() })],
          ['union', z.union([z.string(), z.number()])],
        ] as const satisfies StrictMapEntries,
      });

      const input = new Map<string, unknown>([
        ['array', [1, 2, 3]],
        ['nested', { a: 'test', b: 42 }],
        ['union', 'string-value'],
      ]);

      const result = schema.parse(input);
      expect(result.get('array')).toEqual([1, 2, 3]);
      expect(result.get('nested')).toEqual({ a: 'test', b: 42 });
      expect(result.get('union')).toBe('string-value');
    });

    it('should handle all optional fields', () => {
      const schema = createStrictMapSchema({
        target: 'AllOptional',
        entries: [
          ['field1', z.string().optional()],
          ['field2', z.number().optional()],
        ] as const satisfies StrictMapEntries,
      });

      const emptyInput = new Map();
      const result = schema.parse(emptyInput);
      expect(result.size).toBe(0);
    });

    it('should preserve order even with optional fields mixed', () => {
      const schema = createStrictMapSchema({
        target: 'Mixed',
        entries: [
          ['a', z.string()],
          ['b', z.string().optional()],
          ['c', z.string()],
          ['d', z.string().optional()],
        ] as const satisfies StrictMapEntries,
      });

      const input = new Map<string, unknown>([
        ['c', 'three'],
        ['a', 'one'],
        ['d', 'four'],
      ]);

      const result = schema.parse(input);
      const keys = Array.from(result.keys());
      // Should only include a, c, d in that order (b is optional and not provided)
      expect(keys).toEqual(['a', 'c', 'd']);
    });
  });
});
