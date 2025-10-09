import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createStrictMapSchema, createStrictMapBuilder } from '../StrictMap';
import { mapInvalidTypeMessage } from '../Map';
import { requiredMessage } from '../Required';

describe('createStrictMapSchema', () => {
  describe('should accept valid maps and return normalized Map with defined order', () => {
    it('should parse valid map and preserve defined order (strip mode)', () => {
      const entries = [
        ['family_name', z.string()],
        ['given_name', z.string()],
        ['age', z.number()],
      ] as const;

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
      ] as const;

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
      ] as const;

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
        const schema = createStrictMapSchema({
          target: 'Person',
          entries: [
            ['family_name', z.string()],
            ['given_name', z.string()],
          ] as const,
          unknownKeys: 'strip',
        });

        const input = new Map<string, unknown>([
          ['family_name', 'Doe'],
          ['given_name', 'John'],
          ['extra_key', 'should be removed'],
          ['another_extra', 123],
        ]);

        const result = schema.parse(input);
        expect(result.size).toBe(2);

        const keys = Array.from(result.keys());
        expect(keys).toEqual(['family_name', 'given_name']);
        expect(keys).not.toContain('extra_key');
        expect(keys).not.toContain('another_extra');
      });

      it('should use strip mode by default when unknownKeys is not specified', () => {
        const schema = createStrictMapSchema({
          target: 'Person',
          entries: [
            ['family_name', z.string()],
            ['given_name', z.string()],
          ] as const,
        });

        const input = new Map<string, unknown>([
          ['family_name', 'Doe'],
          ['given_name', 'John'],
          ['extra_key', 'should be removed'],
        ]);

        const result = schema.parse(input);
        expect(result.size).toBe(2);

        const keys = Array.from(result.keys());
        expect(keys).not.toContain('extra_key');
      });
    });

    describe('passthrough mode', () => {
      it('should include unknown keys in output', () => {
        const schema = createStrictMapSchema({
          target: 'Person',
          entries: [
            ['family_name', z.string()],
            ['given_name', z.string()],
          ] as const,
          unknownKeys: 'passthrough',
        });

        const input = new Map<string, unknown>([
          ['family_name', 'Doe'],
          ['given_name', 'John'],
          ['extra_key', 'kept'],
          ['another_extra', 123],
        ]);

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
        const schema = createStrictMapSchema({
          target: 'Person',
          entries: [
            ['family_name', z.string()],
            ['given_name', z.string()],
          ] as const,
          unknownKeys: 'strict',
        });

        const input = new Map<string, unknown>([
          ['family_name', 'Doe'],
          ['given_name', 'John'],
          ['extra_key', 'error'],
        ]);

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
        const schema = createStrictMapSchema({
          target: 'Person',
          entries: [
            ['family_name', z.string()],
            ['given_name', z.string()],
          ] as const,
          unknownKeys: 'strict',
        });

        const input = new Map<string, unknown>([
          ['family_name', 'Doe'],
          ['given_name', 'John'],
        ]);

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
      entries: [['name', z.string()]] as const,
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
        ] as const,
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
        ] as const,
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
        ] as const,
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
        ] as const,
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
      ] as const;

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
      ] as const;

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
      ] as const;

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
      ] as const;

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
        entries: [['key', z.string()]] as const,
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
        ] as const,
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
        ] as const,
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
        ] as const,
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
