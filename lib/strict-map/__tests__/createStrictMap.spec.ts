import { describe, expect, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { createStrictMap } from '../createStrictMap';

describe('createStrictMap', () => {
  it('should create a type-safe map with string keys', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
      ['active', z.boolean()],
    ] as const;

    const map = createStrictMap<typeof entries>();

    // Set values
    map.set('name', 'Alice').set('age', 25).set('active', true);

    // Get values - runtime checks
    expect(map.get('name')).toBe('Alice');
    expect(map.get('age')).toBe(25);
    expect(map.get('active')).toBe(true);

    // Get values - type checks
    expectTypeOf(map.get('name')).toEqualTypeOf<string | undefined>();
    expectTypeOf(map.get('age')).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get('active')).toEqualTypeOf<boolean | undefined>();
  });

  it('should create a type-safe map with number keys', () => {
    const entries = [
      [1, z.number()], // Algorithm
      [4, z.string()], // Key ID
    ] as const;

    const map = createStrictMap<typeof entries>();

    // Set values
    map.set(1, -7);
    map.set(4, 'key-123');

    // Get values - runtime checks
    expect(map.get(1)).toBe(-7);
    expect(map.get(4)).toBe('key-123');

    // Get values - type checks
    expectTypeOf(map.get(1)).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get(4)).toEqualTypeOf<string | undefined>();
  });

  it('should return undefined for non-existent keys', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();

    // Runtime checks
    expect(map.get('name')).toBeUndefined();
    expect(map.get('age')).toBeUndefined();

    // Type checks - still returns the correct type | undefined
    expectTypeOf(map.get('name')).toEqualTypeOf<string | undefined>();
    expectTypeOf(map.get('age')).toEqualTypeOf<number | undefined>();
  });

  it('should check if key exists with has()', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();

    expect(map.has('name')).toBe(false);

    map.set('name', 'Alice');
    expect(map.has('name')).toBe(true);
  });

  it('should delete keys', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();

    map.set('name', 'Alice');
    map.set('age', 25);

    expect(map.delete('name')).toBe(true);
    expect(map.has('name')).toBe(false);
    expect(map.delete('name')).toBe(false);
  });

  it('should clear all entries', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();

    map.set('name', 'Alice');
    map.set('age', 25);

    expect(map.size).toBe(2);

    map.clear();

    expect(map.size).toBe(0);
    expect(map.has('name')).toBe(false);
    expect(map.has('age')).toBe(false);
  });

  it('should support method chaining for set()', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
      ['active', z.boolean()],
    ] as const;

    const map = createStrictMap<typeof entries>()
      .set('name', 'Alice')
      .set('age', 25)
      .set('active', true);

    // Runtime checks
    expect(map.get('name')).toBe('Alice');
    expect(map.get('age')).toBe(25);
    expect(map.get('active')).toBe(true);

    // Type checks
    expectTypeOf(map.get('name')).toEqualTypeOf<string | undefined>();
    expectTypeOf(map.get('age')).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get('active')).toEqualTypeOf<boolean | undefined>();
  });

  it('should iterate over entries', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();
    map.set('name', 'Alice');
    map.set('age', 25);

    const entryArray = Array.from(map.entries());
    expect(entryArray).toEqual([
      ['name', 'Alice'],
      ['age', 25],
    ]);
  });

  it('should iterate over keys', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();
    map.set('name', 'Alice');
    map.set('age', 25);

    const keys = Array.from(map.keys());
    expect(keys).toEqual(['name', 'age']);
  });

  it('should iterate over values', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();
    map.set('name', 'Alice');
    map.set('age', 25);

    const values = Array.from(map.values());
    expect(values).toEqual(['Alice', 25]);
  });

  it('should support forEach', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();
    map.set('name', 'Alice');
    map.set('age', 25);

    const result: Array<[string | number, unknown]> = [];
    map.forEach((value, key) => {
      result.push([key, value]);
    });

    expect(result).toEqual([
      ['name', 'Alice'],
      ['age', 25],
    ]);
  });

  it('should be iterable with for...of', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>();
    map.set('name', 'Alice');
    map.set('age', 25);

    const result: Array<[string | number, unknown]> = [];
    for (const [key, value] of map) {
      result.push([key, value]);
    }

    expect(result).toEqual([
      ['name', 'Alice'],
      ['age', 25],
    ]);
  });

  it('should have correct size property', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
      ['active', z.boolean()],
    ] as const;

    const map = createStrictMap<typeof entries>();

    expect(map.size).toBe(0);

    map.set('name', 'Alice');
    expect(map.size).toBe(1);

    map.set('age', 25);
    expect(map.size).toBe(2);

    map.set('active', true);
    expect(map.size).toBe(3);

    map.delete('age');
    expect(map.size).toBe(2);
  });

  it('should be a pure Map instance (for cbor-x compatibility)', () => {
    const entries = [['name', z.string()]] as const;
    const map = createStrictMap<typeof entries>();

    // Should be a pure Map instance for cbor-x serialization
    expect(Object.prototype.toString.call(map)).toBe('[object Map]');
    expect(map instanceof Map).toBe(true);
  });

  it('should have type-safe get() with complex types', () => {
    const entries = [
      ['user', z.object({ name: z.string(), age: z.number() })],
      ['tags', z.array(z.string())],
      ['score', z.number().optional()],
      ['metadata', z.record(z.string())],
    ] as const;

    const map = createStrictMap<typeof entries>();

    // Set complex values
    map.set('user', { name: 'Alice', age: 30 });
    map.set('tags', ['foo', 'bar']);
    map.set('score', 100);
    map.set('metadata', { key: 'value' });

    // Type checks for complex types
    expectTypeOf(map.get('user')).toEqualTypeOf<
      { name: string; age: number } | undefined
    >();
    expectTypeOf(map.get('tags')).toEqualTypeOf<string[] | undefined>();
    expectTypeOf(map.get('score')).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get('metadata')).toEqualTypeOf<
      Record<string, string> | undefined
    >();
  });

  it('should have type-safe get() with mixed string and number keys', () => {
    const entries = [
      ['name', z.string()],
      [1, z.number()],
      ['active', z.boolean()],
      [2, z.string()],
    ] as const;

    const map = createStrictMap<typeof entries>();

    map.set('name', 'Alice');
    map.set(1, 42);
    map.set('active', true);
    map.set(2, 'value');

    // Type checks for mixed keys
    expectTypeOf(map.get('name')).toEqualTypeOf<string | undefined>();
    expectTypeOf(map.get(1)).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get('active')).toEqualTypeOf<boolean | undefined>();
    expectTypeOf(map.get(2)).toEqualTypeOf<string | undefined>();
  });

  it('should have type-safe get() for each key independently', () => {
    const entries = [
      ['a', z.string()],
      ['b', z.number()],
      ['c', z.boolean()],
    ] as const;

    const map = createStrictMap<typeof entries>();

    // Each key should have its own specific type
    const a = map.get('a');
    const b = map.get('b');
    const c = map.get('c');

    expectTypeOf(a).toEqualTypeOf<string | undefined>();
    expectTypeOf(b).toEqualTypeOf<number | undefined>();
    expectTypeOf(c).toEqualTypeOf<boolean | undefined>();

    // Type checks should be independent
    expectTypeOf(a).not.toEqualTypeOf<number | undefined>();
    expectTypeOf(b).not.toEqualTypeOf<string | undefined>();
    expectTypeOf(c).not.toEqualTypeOf<number | undefined>();
  });

  it('should have type-safe set() with nested objects', () => {
    const entries = [
      [
        'user',
        z.object({
          name: z.string(),
          age: z.number(),
          address: z.object({
            city: z.string(),
            country: z.string(),
          }),
        }),
      ],
      [
        'metadata',
        z.object({ version: z.number(), tags: z.array(z.string()) }),
      ],
    ] as const;

    const map = createStrictMap<typeof entries>();

    // Set nested objects - should accept correct types
    map.set('user', {
      name: 'Alice',
      age: 30,
      address: {
        city: 'Tokyo',
        country: 'Japan',
      },
    });

    map.set('metadata', {
      version: 1,
      tags: ['foo', 'bar'],
    });

    // Runtime checks
    const user = map.get('user');
    expect(user?.name).toBe('Alice');
    expect(user?.age).toBe(30);
    expect(user?.address.city).toBe('Tokyo');
    expect(user?.address.country).toBe('Japan');

    const metadata = map.get('metadata');
    expect(metadata?.version).toBe(1);
    expect(metadata?.tags).toEqual(['foo', 'bar']);

    // Type checks - verify the set() parameter types
    expectTypeOf(map.set).parameter(0).toEqualTypeOf<'user' | 'metadata'>();

    // These would cause type errors if uncommented:
    // map.set('user', { name: 'Bob', age: 'invalid' }); // ✗ age must be number
    // map.set('user', { name: 'Bob' }); // ✗ missing required fields
    // map.set('metadata', { version: '1' }); // ✗ version must be number
  });

  it('should have type-safe set() with arrays', () => {
    const entries = [
      ['tags', z.array(z.string())],
      ['scores', z.array(z.number())],
      ['users', z.array(z.object({ id: z.number(), name: z.string() }))],
    ] as const;

    const map = createStrictMap<typeof entries>();

    // Set arrays - should accept correct types
    map.set('tags', ['tag1', 'tag2', 'tag3']);
    map.set('scores', [100, 95, 88]);
    map.set('users', [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);

    // Runtime checks
    expect(map.get('tags')).toEqual(['tag1', 'tag2', 'tag3']);
    expect(map.get('scores')).toEqual([100, 95, 88]);
    expect(map.get('users')).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);

    // Type checks
    expectTypeOf(map.get('tags')).toEqualTypeOf<string[] | undefined>();
    expectTypeOf(map.get('scores')).toEqualTypeOf<number[] | undefined>();
    expectTypeOf(map.get('users')).toEqualTypeOf<
      Array<{ id: number; name: string }> | undefined
    >();

    // These would cause type errors if uncommented:
    // map.set('tags', [1, 2, 3]); // ✗ array elements must be strings
    // map.set('scores', ['a', 'b']); // ✗ array elements must be numbers
    // map.set('users', [{ id: '1', name: 'Alice' }]); // ✗ id must be number
  });

  it('should have type-safe set() with nested maps and complex structures', () => {
    const entries = [
      ['config', z.record(z.string(), z.number())],
      ['nestedArray', z.array(z.array(z.string()))],
      [
        'complexObject',
        z.object({
          data: z.array(z.object({ key: z.string(), value: z.number() })),
          metadata: z.record(z.string(), z.any()),
        }),
      ],
    ] as const;

    const map = createStrictMap<typeof entries>();

    // Set nested structures
    map.set('config', { key1: 1, key2: 2, key3: 3 });
    map.set('nestedArray', [
      ['a', 'b'],
      ['c', 'd'],
    ]);
    map.set('complexObject', {
      data: [
        { key: 'k1', value: 10 },
        { key: 'k2', value: 20 },
      ],
      metadata: { info: 'test', count: 2 },
    });

    // Runtime checks
    const config = map.get('config');
    expect(config?.key1).toBe(1);
    expect(config?.key2).toBe(2);

    const nestedArray = map.get('nestedArray');
    expect(nestedArray?.[0]).toEqual(['a', 'b']);
    expect(nestedArray?.[1]).toEqual(['c', 'd']);

    const complexObject = map.get('complexObject');
    expect(complexObject?.data).toHaveLength(2);
    expect(complexObject?.data[0]).toEqual({ key: 'k1', value: 10 });

    // Type checks
    expectTypeOf(map.get('config')).toEqualTypeOf<
      Record<string, number> | undefined
    >();
    expectTypeOf(map.get('nestedArray')).toEqualTypeOf<
      string[][] | undefined
    >();

    // These would cause type errors if uncommented:
    // map.set('config', { key1: 'string' }); // ✗ values must be numbers
    // map.set('nestedArray', [['a'], [1]]); // ✗ inner arrays must contain strings
    // map.set('complexObject', { data: [] }); // ✗ missing required metadata field
  });

  it('should have type-safe set() with optional and nullable fields', () => {
    const entries = [
      ['optional', z.string().optional()],
      ['nullable', z.string().nullable()],
      ['optionalNullable', z.string().optional().nullable()],
      [
        'nestedOptional',
        z.object({
          required: z.string(),
          optional: z.number().optional(),
        }),
      ],
    ] as const;

    const map = createStrictMap<typeof entries>();

    // Set optional values
    map.set('optional', 'value');
    map.set('optional', undefined);
    map.set('nullable', 'value');
    map.set('nullable', null);
    map.set('optionalNullable', 'value');
    map.set('optionalNullable', null);
    map.set('optionalNullable', undefined);

    // Set nested optional
    map.set('nestedOptional', { required: 'req' });
    map.set('nestedOptional', { required: 'req', optional: 42 });

    // Runtime checks
    expect(map.get('optional')).toBeUndefined();
    expect(map.get('nullable')).toBeNull();

    const nestedOpt = map.get('nestedOptional');
    expect(nestedOpt?.required).toBe('req');
    expect(nestedOpt?.optional).toBe(42);

    // Type checks
    expectTypeOf(map.get('optional')).toEqualTypeOf<string | undefined>();
    expectTypeOf(map.get('nullable')).toEqualTypeOf<
      string | null | undefined
    >();
    expectTypeOf(map.get('optionalNullable')).toEqualTypeOf<
      string | null | undefined
    >();

    // These would cause type errors if uncommented:
    // map.set('optional', null); // ✗ optional accepts undefined but not null
    // map.set('nullable', undefined); // ✗ nullable accepts null but validation might fail
    // map.set('nestedOptional', {}); // ✗ missing required field
  });

  it('should accept initial entries in constructor', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
      ['active', z.boolean()],
    ] as const;

    const map = createStrictMap<typeof entries>([
      ['name', 'Alice'],
      ['age', 25],
      ['active', true],
    ]);

    // Runtime checks - values should be set
    expect(map.get('name')).toBe('Alice');
    expect(map.get('age')).toBe(25);
    expect(map.get('active')).toBe(true);
    expect(map.size).toBe(3);

    // Type checks
    expectTypeOf(map.get('name')).toEqualTypeOf<string | undefined>();
    expectTypeOf(map.get('age')).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get('active')).toEqualTypeOf<boolean | undefined>();
  });

  it('should accept initial entries with number keys', () => {
    const entries = [
      [1, z.number()],
      [4, z.string()],
    ] as const;

    const map = createStrictMap<typeof entries>([
      [1, -7],
      [4, 'key-123'],
    ]);

    expect(map.get(1)).toBe(-7);
    expect(map.get(4)).toBe('key-123');
    expect(map.size).toBe(2);

    expectTypeOf(map.get(1)).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get(4)).toEqualTypeOf<string | undefined>();
  });

  it('should accept partial initial entries', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
      ['active', z.boolean()],
    ] as const;

    const map = createStrictMap<typeof entries>([['name', 'Alice']]);

    expect(map.get('name')).toBe('Alice');
    expect(map.get('age')).toBeUndefined();
    expect(map.get('active')).toBeUndefined();
    expect(map.size).toBe(1);

    // Can still add more entries after creation
    map.set('age', 30);
    expect(map.get('age')).toBe(30);
    expect(map.size).toBe(2);
  });

  it('should accept initial entries with nested objects', () => {
    const entries = [
      [
        'user',
        z.object({
          name: z.string(),
          age: z.number(),
          address: z.object({
            city: z.string(),
            country: z.string(),
          }),
        }),
      ],
      [
        'metadata',
        z.object({ version: z.number(), tags: z.array(z.string()) }),
      ],
    ] as const;

    const map = createStrictMap<typeof entries>([
      [
        'user',
        {
          name: 'Alice',
          age: 30,
          address: {
            city: 'Tokyo',
            country: 'Japan',
          },
        },
      ],
      [
        'metadata',
        {
          version: 1,
          tags: ['foo', 'bar'],
        },
      ],
    ]);

    const user = map.get('user');
    expect(user?.name).toBe('Alice');
    expect(user?.age).toBe(30);
    expect(user?.address.city).toBe('Tokyo');

    const metadata = map.get('metadata');
    expect(metadata?.version).toBe(1);
    expect(metadata?.tags).toEqual(['foo', 'bar']);
  });

  it('should accept initial entries from another map', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    // Create a map with some values
    const map1 = createStrictMap<typeof entries>([
      ['name', 'Alice'],
      ['age', 25],
    ]);

    // Create a new map from the first map's entries
    const map2 = createStrictMap<typeof entries>([...map1.entries()]);

    expect(map2.get('name')).toBe('Alice');
    expect(map2.get('age')).toBe(25);
    expect(map2.size).toBe(2);

    // Maps should be independent
    map1.set('name', 'Bob');
    expect(map1.get('name')).toBe('Bob');
    expect(map2.get('name')).toBe('Alice');
  });

  it('should have type-safe entries() method', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
      ['active', z.boolean()],
    ] as const;

    const map = createStrictMap<typeof entries>([
      ['name', 'Alice'],
      ['age', 25],
      ['active', true],
    ]);

    // Runtime checks
    const entriesArray = [...map.entries()];
    expect(entriesArray).toEqual([
      ['name', 'Alice'],
      ['age', 25],
      ['active', true],
    ]);

    // Type checks - entries() should return accurate tuple types
    for (const entry of map.entries()) {
      expectTypeOf(entry).toMatchTypeOf<
        | readonly ['name', string]
        | readonly ['age', number]
        | readonly ['active', boolean]
      >();
    }
  });

  it('should have type-safe keys() method', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>([
      ['name', 'Alice'],
      ['age', 25],
    ]);

    // Runtime checks
    const keysArray = [...map.keys()];
    expect(keysArray).toEqual(['name', 'age']);

    // Type checks
    for (const key of map.keys()) {
      expectTypeOf(key).toEqualTypeOf<'name' | 'age'>();
    }
  });

  it('should have type-safe values() method', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>([
      ['name', 'Alice'],
      ['age', 25],
    ]);

    // Runtime checks
    const valuesArray = [...map.values()];
    expect(valuesArray).toEqual(['Alice', 25]);

    // Type checks - values() should return union of value types
    for (const value of map.values()) {
      expectTypeOf(value).toMatchTypeOf<string | number>();
    }
  });

  it('should have type-safe Symbol.iterator', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createStrictMap<typeof entries>([
      ['name', 'Alice'],
      ['age', 25],
    ]);

    // Runtime checks - should be iterable
    const iteratedEntries = [];
    for (const entry of map) {
      iteratedEntries.push(entry);
    }
    expect(iteratedEntries).toEqual([
      ['name', 'Alice'],
      ['age', 25],
    ]);

    // Type checks
    for (const entry of map) {
      expectTypeOf(entry).toMatchTypeOf<
        readonly ['name', string] | readonly ['age', number]
      >();
    }
  });
});
