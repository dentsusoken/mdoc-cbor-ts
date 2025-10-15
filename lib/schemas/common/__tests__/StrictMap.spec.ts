import { describe, expect, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import {
  createStrictMapSchema,
  strictMapNotMapMessage,
  strictMapMissingKeysMessage,
  strictMapUnexpectedKeysMessage,
  strictMapKeyValueMessage,
} from '../StrictMap';

describe('createStrictMapSchema', () => {
  describe('successful validation', () => {
    it('should validate a valid map with all required keys', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number()],
        ['active', z.boolean()],
      ] as const;

      const schema = createStrictMapSchema({ target: 'Person', entries });

      const validMap = new Map<string | number, unknown>([
        ['name', 'Alice'],
        ['age', 25],
        ['active', true],
      ]);

      const result = schema.parse(validMap);

      expect(result.get('name')).toBe('Alice');
      expect(result.get('age')).toBe(25);
      expect(result.get('active')).toBe(true);

      // Test type safety of get method
      expectTypeOf(result.get('name')).toEqualTypeOf<string | undefined>();
      expectTypeOf(result.get('age')).toEqualTypeOf<number | undefined>();
      expectTypeOf(result.get('active')).toEqualTypeOf<boolean | undefined>();
    });

    it('should validate a map with number keys', () => {
      const entries = [
        [1, z.number()],
        [4, z.string()],
      ] as const;

      const schema = createStrictMapSchema({ target: 'Headers', entries });

      const validMap = new Map<string | number, unknown>([
        [1, -7],
        [4, 'key-123'],
      ]);

      const result = schema.parse(validMap);

      expect(result.get(1)).toBe(-7);
      expect(result.get(4)).toBe('key-123');

      // Test type safety of get method with number keys
      expectTypeOf(result.get(1)).toEqualTypeOf<number | undefined>();
      expectTypeOf(result.get(4)).toEqualTypeOf<string | undefined>();
    });

    it('should validate map with optional keys when present', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number().optional()],
      ] as const;

      const schema = createStrictMapSchema({ target: 'User', entries });

      const validMap = new Map<string | number, unknown>([
        ['name', 'Alice'],
        ['age', 25],
      ]);

      const result = schema.parse(validMap);

      expect(result.get('name')).toBe('Alice');
      expect(result.get('age')).toBe(25);

      // Test type safety of get method with optional keys
      expectTypeOf(result.get('name')).toEqualTypeOf<string | undefined>();
      expectTypeOf(result.get('age')).toEqualTypeOf<number | undefined>();
    });

    it('should validate map with optional keys when absent', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number().optional()],
      ] as const;

      const schema = createStrictMapSchema({ target: 'User', entries });

      const validMap = new Map([['name', 'Alice']]);

      const result = schema.parse(validMap);

      expect(result.get('name')).toBe('Alice');
      expect(result.get('age')).toBeUndefined();

      // Test type safety of get method with missing optional keys
      expectTypeOf(result.get('name')).toEqualTypeOf<string | undefined>();
      expectTypeOf(result.get('age')).toEqualTypeOf<number | undefined>();
    });

    it('should validate map with nullable values', () => {
      const entries = [
        ['name', z.string()],
        ['middleName', z.string().nullable()],
      ] as const;

      const schema = createStrictMapSchema({ target: 'Person', entries });

      const validMap = new Map([
        ['name', 'Alice'],
        ['middleName', null],
      ]);

      const result = schema.parse(validMap);

      expect(result.get('name')).toBe('Alice');
      expect(result.get('middleName')).toBeNull();

      // Test type safety of get method with nullable values
      expectTypeOf(result.get('name')).toEqualTypeOf<string | undefined>();
      expectTypeOf(result.get('middleName')).toEqualTypeOf<
        string | null | undefined
      >();
    });

    it('should validate map with nested maps', () => {
      const userSchema = createStrictMapSchema({
        target: 'User',
        entries: [
          ['name', z.string()],
          ['age', z.number()],
        ] as const,
      });

      const metadataSchema = createStrictMapSchema({
        target: 'Metadata',
        entries: [['version', z.number()]] as const,
      });

      const entries = [
        ['user', userSchema],
        ['metadata', metadataSchema],
      ] as const;

      const schema = createStrictMapSchema({ target: 'Data', entries });

      const validMap = new Map<string | number, unknown>([
        [
          'user',
          new Map<string | number, unknown>([
            ['name', 'Alice'],
            ['age', 25],
          ]),
        ],
        ['metadata', new Map<string | number, unknown>([['version', 1]])],
      ]);

      const result = schema.parse(validMap);

      const user = result.get('user');
      const metadata = result.get('metadata');
      expect(user).toBeDefined();
      expect(metadata).toBeDefined();
      expect(user!.get('name')).toBe('Alice');
      expect(user!.get('age')).toBe(25);
      expect(metadata!.get('version')).toBe(1);

      // Test type safety of get method with nested maps
      // Note: createStrictMapSchema returns StrictMap<T>, so nested maps are also StrictMap instances
      // Test the nested map values directly
      expectTypeOf(user!.get('name')).toEqualTypeOf<string | undefined>();
      expectTypeOf(user!.get('age')).toEqualTypeOf<number | undefined>();
      expectTypeOf(metadata!.get('version')).toEqualTypeOf<
        number | undefined
      >();
    });

    it('should validate map with array values', () => {
      const entries = [
        ['tags', z.array(z.string())],
        ['scores', z.array(z.number())],
      ] as const;

      const schema = createStrictMapSchema({ target: 'Config', entries });

      const validMap = new Map([
        ['tags', ['foo', 'bar', 'baz']],
        ['scores', [85, 90, 95]],
      ]);

      const result = schema.parse(validMap);

      expect(result.get('tags')).toEqual(['foo', 'bar', 'baz']);
      expect(result.get('scores')).toEqual([85, 90, 95]);

      // Test type safety of get method with array values
      expectTypeOf(result.get('tags')).toEqualTypeOf<string[] | undefined>();
      expectTypeOf(result.get('scores')).toEqualTypeOf<number[] | undefined>();
    });

    it('should use safeParse to check validity without throwing', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number()],
      ] as const;

      const schema = createStrictMapSchema({ target: 'User', entries });

      const validMap = new Map<string | number, unknown>([
        ['name', 'Alice'],
        ['age', 25],
      ]);

      const invalidMap = new Map([['name', 'Alice']]);

      const validResult = schema.safeParse(validMap);
      const invalidResult = schema.safeParse(invalidMap);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate empty map when all keys are optional', () => {
      const entries = [
        ['name', z.string().optional()],
        ['age', z.number().optional()],
      ] as const;

      const schema = createStrictMapSchema({ target: 'OptionalData', entries });

      const emptyMap = new Map();

      const result = schema.parse(emptyMap);

      expect(result.size).toBe(0);
    });

    it('should work with union types', () => {
      const entries = [['value', z.union([z.string(), z.number()])]] as const;

      const schema = createStrictMapSchema({ target: 'Data', entries });

      const map1 = new Map([['value', 'string value']]);
      const map2 = new Map([['value', 42]]);

      const result1 = schema.parse(map1);
      const result2 = schema.parse(map2);

      expect(result1.get('value')).toBe('string value');
      expect(result2.get('value')).toBe(42);

      // Test type safety of get method with union types
      expectTypeOf(result1.get('value')).toEqualTypeOf<
        string | number | undefined
      >();
      expectTypeOf(result2.get('value')).toEqualTypeOf<
        string | number | undefined
      >();
    });

    it('should work with literal types', () => {
      const entries = [
        ['type', z.literal('user')],
        ['status', z.enum(['active', 'inactive'])],
      ] as const;

      const schema = createStrictMapSchema({ target: 'User', entries });

      const validMap = new Map([
        ['type', 'user'],
        ['status', 'active'],
      ]);

      const result = schema.parse(validMap);

      expect(result.get('type')).toBe('user');
      expect(result.get('status')).toBe('active');

      // Test type safety of get method with literal and enum types
      expectTypeOf(result.get('type')).toEqualTypeOf<'user' | undefined>();
      expectTypeOf(result.get('status')).toEqualTypeOf<
        'active' | 'inactive' | undefined
      >();
    });

    describe('unknownKeys modes', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number()],
      ] as const;

      it('should strip unknown keys in strip mode', () => {
        const schema = createStrictMapSchema({
          target: 'User',
          entries,
          unknownKeys: 'strip',
        });

        const inputMap = new Map<string | number, unknown>([
          ['name', 'Alice'],
          ['age', 25],
          ['extra1', 'removed'],
          ['extra2', 'also removed'],
        ]);

        const result = schema.parse(inputMap);

        expect(result.get('name')).toBe('Alice');
        expect(result.get('age')).toBe(25);
        expect(result.has('extra1' as 'name')).toBe(false);
        expect(result.has('extra2' as 'name')).toBe(false);
        expect(result.size).toBe(2);
      });

      it('should handle multiple unknown keys in strip mode', () => {
        const schema = createStrictMapSchema({
          target: 'Config',
          entries,
          unknownKeys: 'strip',
        });

        const inputMap = new Map<string | number, unknown>([
          ['name', 'Config1'],
          ['age', 10],
          ['unknown1', 'value1'],
          ['unknown2', 'value2'],
          ['unknown3', 'value3'],
        ]);

        const result = schema.parse(inputMap);

        expect(result.size).toBe(2);
        expect(result.get('name')).toBe('Config1');
        expect(result.get('age')).toBe(10);
      });

      it('should work with optional keys in strip mode', () => {
        const entriesWithOptional = [
          ['required', z.string()],
          ['optional', z.number().optional()],
        ] as const;

        const schema = createStrictMapSchema({
          target: 'Data',
          entries: entriesWithOptional,
          unknownKeys: 'strip',
        });

        const inputMap = new Map<string | number, unknown>([
          ['required', 'value'],
          ['extra', 'removed'],
        ]);

        const result = schema.parse(inputMap);

        expect(result.get('required')).toBe('value');
        expect(result.has('optional' as 'required')).toBe(false);
        expect(result.has('extra' as 'required')).toBe(false);
        expect(result.size).toBe(1);
      });
    });
  });

  describe('validation errors', () => {
    it('should fail validation when required key is missing', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number()],
      ] as const;

      const schema = createStrictMapSchema({ target: 'User', entries });

      const invalidMap = new Map([['name', 'Alice']]);

      try {
        schema.parse(invalidMap);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          strictMapMissingKeysMessage('User', ['age'])
        );
      }
    });

    it('should fail validation when value type is incorrect', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number()],
      ] as const;

      const schema = createStrictMapSchema({ target: 'User', entries });

      const invalidMap = new Map([
        ['name', 'Alice'],
        ['age', 'not a number'],
      ]);

      try {
        schema.parse(invalidMap);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['age']);
        expect(zodError.issues[0].message).toBe(
          strictMapKeyValueMessage(
            'User',
            'age',
            'Expected number, received string'
          )
        );
      }
    });

    it('should fail validation for nested maps with incorrect structure', () => {
      const userSchema = createStrictMapSchema({
        target: 'User',
        entries: [
          ['name', z.string()],
          ['age', z.number()],
        ] as const,
      });

      const entries = [['user', userSchema]] as const;

      const schema = createStrictMapSchema({ target: 'Data', entries });

      const invalidMap = new Map<string | number, unknown>([
        [
          'user',
          new Map<string | number, unknown>([
            ['name', 'Alice'],
            ['age', 'not a number'],
          ]),
        ],
      ]);

      try {
        schema.parse(invalidMap);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['user', 'age']);
        expect(zodError.issues[0].message).toBe(
          strictMapKeyValueMessage(
            'Data',
            'user',
            strictMapKeyValueMessage(
              'User',
              'age',
              'Expected number, received string'
            )
          )
        );
      }
    });

    it('should fail validation for deeper nested maps with incorrect structure', () => {
      const userSchema = createStrictMapSchema({
        target: 'User',
        entries: [
          ['name', z.string()],
          ['age', z.number()],
        ] as const,
      });

      const dataSchema = createStrictMapSchema({
        target: 'Data',
        entries: [['user', userSchema]] as const,
      });

      const containerSchema = createStrictMapSchema({
        target: 'Container',
        entries: [['payload', dataSchema]] as const,
      });

      const invalidMap = new Map<string | number, unknown>([
        [
          'payload',
          new Map<string | number, unknown>([
            [
              'user',
              new Map<string | number, unknown>([
                ['name', 'Alice'],
                ['age', 'not a number'],
              ]),
            ],
          ]),
        ],
      ]);

      try {
        containerSchema.parse(invalidMap);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['payload', 'user', 'age']);
        expect(zodError.issues[0].message).toBe(
          strictMapKeyValueMessage(
            'Container',
            'payload',
            strictMapKeyValueMessage(
              'Data',
              'user',
              strictMapKeyValueMessage(
                'User',
                'age',
                'Expected number, received string'
              )
            )
          )
        );
      }

      console.log(
        strictMapKeyValueMessage(
          'Container',
          'payload',
          strictMapKeyValueMessage(
            'Data',
            'user',
            strictMapKeyValueMessage(
              'User',
              'age',
              'Expected number, received string'
            )
          )
        )
      );
    });

    it('should provide detailed error messages for multiple validation errors', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number()],
        ['email', z.string().email()],
      ] as const;

      const schema = createStrictMapSchema({ target: 'User', entries });

      const invalidMap = new Map<string | number, unknown>([
        ['name', 123], // Wrong type
        ['age', 'not a number'], // Wrong type
        ['email', 'invalid-email'], // Invalid format
      ]);

      try {
        schema.parse(invalidMap);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeDefined();
        // Check that multiple errors are reported
        const zodError = error as z.ZodError;
        expect(zodError.issues.length).toBe(3);
      }
    });

    it('should fail with invalid literal', () => {
      const entries = [
        ['type', z.literal('user')],
        ['status', z.enum(['active', 'inactive'])],
      ] as const;

      const schema = createStrictMapSchema({ target: 'User', entries });

      const invalidMap = new Map([
        ['type', 'admin'],
        ['status', 'active'],
      ]);

      try {
        schema.parse(invalidMap);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual(['type']);
        expect(zodError.issues[0].message).toBe(
          strictMapKeyValueMessage(
            'User',
            'type',
            'Invalid literal value, expected "user"'
          )
        );
      }
    });

    it('should fail validation for unknown keys in strict mode', () => {
      const entries = [
        ['name', z.string()],
        ['age', z.number()],
      ] as const;

      const schema = createStrictMapSchema({
        target: 'User',
        entries,
        unknownKeys: 'strict',
      });

      const inputMap = new Map<string | number, unknown>([
        ['name', 'Alice'],
        ['age', 25],
        ['extra', 'causes error'],
      ]);

      try {
        schema.parse(inputMap);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].path).toEqual([]);
        expect(zodError.issues[0].message).toBe(
          strictMapUnexpectedKeysMessage('User', ['extra'])
        );
      }
    });

    describe('non-Map inputs', () => {
      const entries = [['name', z.string()]] as const;
      const schema = createStrictMapSchema({ target: 'User', entries });

      const cases: Array<[string, unknown, string]> = [
        ['plain object', {}, 'Object'],
        ['array', [], 'Array'],
        ['string', 'hello', 'string'],
        ['number', 123, 'number'],
        ['boolean', true, 'boolean'],
        ['null', null, 'object'],
        ['undefined', undefined, 'undefined'],
      ];

      for (const [name, input, expectedType] of cases) {
        it(`should fail validation when input is not a Map (${name})`, () => {
          try {
            schema.parse(input as unknown as Map<unknown, unknown>);
            expect.fail('Should have thrown validation error');
          } catch (error) {
            const zodError = error as z.ZodError;
            expect(zodError.issues[0].path).toEqual([]);
            expect(zodError.issues[0].message).toBe(
              strictMapNotMapMessage('User', expectedType)
            );
          }

          const result = schema.safeParse(
            input as unknown as Map<unknown, unknown>
          );
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toBe(
              strictMapNotMapMessage('User', expectedType)
            );
          }
        });
      }
    });
  });
});
