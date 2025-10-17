import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { createSemiStrictMap } from '../createSemiStrictMap';
import { EnumNumberValues } from '@/types';

describe('createSemiStrictMap', () => {
  it('should have type-safe set/get for known keys', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
      ContentType = 3,
      IV = 5,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>();

    // Known keys - fully type-safe
    map.set(Header.Algorithm, -7);
    map.set(Header.KeyId, 'key-123');
    map.set(Header.ContentType, 'application/json');

    // Runtime checks
    expect(map.get(Header.Algorithm)).toBe(-7);
    expect(map.get(Header.KeyId)).toBe('key-123');
    expect(map.get(Header.ContentType)).toBe('application/json');

    // Type checks for known keys
    expectTypeOf(map.get(Header.Algorithm)).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get(Header.KeyId)).toEqualTypeOf<string | undefined>();
    expectTypeOf(map.get(Header.ContentType)).toEqualTypeOf<unknown>();
  });

  it('should accept any value for unknown keys', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
      ContentType = 3,
      IV = 5,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>();

    // Unknown keys - key is checked, value is flexible
    map.set(Header.ContentType, 'application/cbor');
    map.set(Header.IV, new Uint8Array([1, 2, 3]));
    map.set(Header.IV, 'string value'); // ✓ any value accepted
    map.set(Header.IV, 123); // ✓ any value accepted

    // Runtime checks
    expect(map.get(Header.ContentType)).toBe('application/cbor');
    expect(map.get(Header.IV)).toBe(123);

    // Type checks for unknown keys
    expectTypeOf(map.get(Header.ContentType)).toEqualTypeOf<unknown>();
    expectTypeOf(map.get(Header.IV)).toEqualTypeOf<unknown>();
  });

  it('should work with string keys and enum', () => {
    type AllowedKeys = 'name' | 'age' | 'email' | 'phone';

    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, AllowedKeys>();

    // Known keys - type-safe
    map.set('name', 'Alice');
    map.set('age', 25);

    // Unknown keys - flexible
    map.set('email', 'alice@example.com');
    map.set('phone', '+1234567890');
    map.set('email', 123); // ✓ any value accepted for unknown keys

    // Runtime checks
    expect(map.get('name')).toBe('Alice');
    expect(map.get('age')).toBe(25);
    expect(map.get('email')).toBe(123);
    expect(map.get('phone')).toBe('+1234567890');

    // Type checks
    expectTypeOf(map.get('name')).toEqualTypeOf<string | undefined>();
    expectTypeOf(map.get('age')).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get('email')).toEqualTypeOf<unknown>();
    expectTypeOf(map.get('phone')).toEqualTypeOf<unknown>();
  });

  it('should support method chaining', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
      ContentType = 3,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>()
      .set(Header.Algorithm, -7)
      .set(Header.KeyId, 'key-123')
      .set(Header.ContentType, 'application/cbor');

    expect(map.get(Header.Algorithm)).toBe(-7);
    expect(map.get(Header.KeyId)).toBe('key-123');
    expect(map.get(Header.ContentType)).toBe('application/cbor');
  });

  it('should work with mixed known and unknown keys', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
      ContentType = 3,
      IV = 5,
      CustomHeader = 100,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>();

    // Set known keys with type-safe values
    map.set(Header.Algorithm, -7);
    map.set(Header.KeyId, 'key-123');

    // Set unknown keys with any values
    map.set(Header.ContentType, 'text/plain');
    map.set(Header.IV, new Uint8Array([1, 2, 3]));
    map.set(Header.CustomHeader, { custom: 'data' });

    // All keys are accessible
    expect(map.has(Header.Algorithm)).toBe(true);
    expect(map.has(Header.KeyId)).toBe(true);
    expect(map.has(Header.ContentType)).toBe(true);
    expect(map.has(Header.IV)).toBe(true);
    expect(map.has(Header.CustomHeader)).toBe(true);

    expect(map.size).toBe(5);
  });

  it('should support delete for both known and unknown keys', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
      ContentType = 3,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>();

    map.set(Header.Algorithm, -7);
    map.set(Header.KeyId, 'key-123');
    map.set(Header.ContentType, 'application/cbor');

    // Delete known key
    expect(map.delete(Header.Algorithm)).toBe(true);
    expect(map.has(Header.Algorithm)).toBe(false);

    // Delete unknown key
    expect(map.delete(Header.ContentType)).toBe(true);
    expect(map.has(Header.ContentType)).toBe(false);

    expect(map.size).toBe(1);
  });

  it('should be a pure Map instance', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [[Header.Algorithm, z.number()]] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>();

    // Should be a pure Map instance for cbor-x serialization
    expect(Object.prototype.toString.call(map)).toBe('[object Map]');
    expect(map instanceof Map).toBe(true);
  });

  it('should handle complex value types for known keys', () => {
    enum Keys {
      User = 1,
      Config = 2,
      Metadata = 3,
    }

    const entries = [
      [Keys.User, z.object({ name: z.string(), age: z.number() })],
      [Keys.Config, z.array(z.string())],
    ] as const;

    const map = createSemiStrictMap<typeof entries, Keys>();

    // Known keys with complex types
    map.set(Keys.User, { name: 'Alice', age: 30 });
    map.set(Keys.Config, ['option1', 'option2']);

    // Unknown key with any value
    map.set(Keys.Metadata, { version: 1, tags: ['tag1'] });

    // Runtime checks
    const user = map.get(Keys.User);
    expect(user?.name).toBe('Alice');
    expect(user?.age).toBe(30);

    const config = map.get(Keys.Config);
    expect(config).toEqual(['option1', 'option2']);

    // Type checks
    expectTypeOf(map.get(Keys.User)).toEqualTypeOf<
      { name: string; age: number } | undefined
    >();
    expectTypeOf(map.get(Keys.Config)).toEqualTypeOf<string[] | undefined>();
    expectTypeOf(map.get(Keys.Metadata)).toEqualTypeOf<unknown>();
  });

  it('should work with default U parameter (string | number)', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    // Without specifying U, it defaults to string | number
    const map = createSemiStrictMap<typeof entries>();

    // Known keys
    map.set('name', 'Alice');
    map.set('age', 25);

    // Unknown keys - any string or number key is allowed
    map.set('email', 'alice@example.com');
    map.set(999, 'some value');

    expect(map.get('name')).toBe('Alice');
    expect(map.get('email')).toBe('alice@example.com');
    expect(map.get(999)).toBe('some value');
  });

  it('should accept initial entries in constructor', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
      ContentType = 3,
      IV = 5,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>([
      [Header.Algorithm, -7],
      [Header.KeyId, 'key-123'],
      [Header.ContentType, 'application/cbor'],
    ]);

    // Runtime checks - known keys
    expect(map.get(Header.Algorithm)).toBe(-7);
    expect(map.get(Header.KeyId)).toBe('key-123');

    // Runtime checks - unknown keys
    expect(map.get(Header.ContentType)).toBe('application/cbor');
    expect(map.size).toBe(3);

    // Type checks
    expectTypeOf(map.get(Header.Algorithm)).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get(Header.KeyId)).toEqualTypeOf<string | undefined>();
    expectTypeOf(map.get(Header.ContentType)).toEqualTypeOf<unknown>();
  });

  it('should accept initial entries with mixed known and unknown keys', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    type AllowedKeys = 'name' | 'age' | 'email' | 'phone';

    const map = createSemiStrictMap<typeof entries, AllowedKeys>([
      ['name', 'Alice'],
      ['age', 25],
      ['email', 'alice@example.com'],
      ['phone', '+1234567890'],
    ]);

    expect(map.get('name')).toBe('Alice');
    expect(map.get('age')).toBe(25);
    expect(map.get('email')).toBe('alice@example.com');
    expect(map.get('phone')).toBe('+1234567890');
    expect(map.size).toBe(4);

    // Type checks
    expectTypeOf(map.get('name')).toEqualTypeOf<string | undefined>();
    expectTypeOf(map.get('age')).toEqualTypeOf<number | undefined>();
    expectTypeOf(map.get('email')).toEqualTypeOf<unknown>();
    expectTypeOf(map.get('phone')).toEqualTypeOf<unknown>();
  });

  it('should accept partial initial entries', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
      ContentType = 3,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>([
      [Header.Algorithm, -7],
    ]);

    expect(map.get(Header.Algorithm)).toBe(-7);
    expect(map.get(Header.KeyId)).toBeUndefined();
    expect(map.size).toBe(1);

    // Can still add more entries after creation
    map.set(Header.KeyId, 'key-123');
    map.set(Header.ContentType, 'application/cbor');
    expect(map.get(Header.KeyId)).toBe('key-123');
    expect(map.get(Header.ContentType)).toBe('application/cbor');
    expect(map.size).toBe(3);
  });

  it('should accept initial entries from another map', () => {
    const entries = [
      ['name', z.string()],
      ['age', z.number()],
    ] as const;

    type AllowedKeys = 'name' | 'age' | 'email';

    // Create a map with some values
    const map1 = createSemiStrictMap<typeof entries, AllowedKeys>([
      ['name', 'Alice'],
      ['age', 25],
      ['email', 'alice@example.com'],
    ]);

    // Create a new map from the first map's entries
    const map2 = createSemiStrictMap<typeof entries, AllowedKeys>([
      ...map1.entries(),
    ]);

    expect(map2.get('name')).toBe('Alice');
    expect(map2.get('age')).toBe(25);
    expect(map2.get('email')).toBe('alice@example.com');
    expect(map2.size).toBe(3);

    // Maps should be independent
    map1.set('name', 'Bob');
    expect(map1.get('name')).toBe('Bob');
    expect(map2.get('name')).toBe('Alice');
  });

  it('should have type-safe entries() method', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
      ContentType = 3,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>([
      [Header.Algorithm, -7],
      [Header.KeyId, 'key-123'],
      [Header.ContentType, 'application/cbor'],
    ]);

    // Runtime checks
    const entriesArray = [...map.entries()];
    expect(entriesArray).toEqual([
      [1, -7],
      [4, 'key-123'],
      [3, 'application/cbor'],
    ]);

    // Type checks - entries() should return accurate tuple types
    for (const entry of map.entries()) {
      expectTypeOf(entry).toMatchTypeOf<
        readonly [1, number] | readonly [4, string] | readonly [3, unknown]
      >();
    }
  });

  it('should have type-safe keys() method', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
      ContentType = 3,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>([
      [Header.Algorithm, -7],
      [Header.ContentType, 'application/cbor'],
    ]);

    // Runtime checks
    const keysArray = [...map.keys()];
    expect(keysArray).toContain(1);
    expect(keysArray).toContain(3);

    // Type checks
    for (const key of map.keys()) {
      expectTypeOf(key).toEqualTypeOf<Header>();
    }
  });

  it('should have type-safe values() method', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
      ContentType = 3,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>([
      [Header.Algorithm, -7],
      [Header.ContentType, 'application/cbor'],
    ]);

    // Runtime checks
    const valuesArray = [...map.values()];
    expect(valuesArray).toContain(-7);
    expect(valuesArray).toContain('application/cbor');

    // Type checks - values() should return union of all possible value types
    for (const value of map.values()) {
      expectTypeOf(value).toMatchTypeOf<number | string | unknown>();
    }
  });

  it('should have type-safe Symbol.iterator', () => {
    enum Header {
      Algorithm = 1,
      KeyId = 4,
    }
    type HeadersValues = EnumNumberValues<typeof Header>;

    const entries = [
      [Header.Algorithm, z.number()],
      [Header.KeyId, z.string()],
    ] as const;

    const map = createSemiStrictMap<typeof entries, HeadersValues>([
      [Header.Algorithm, -7],
      [Header.KeyId, 'key-123'],
    ]);

    // Runtime checks - should be iterable
    const iteratedEntries = [];
    for (const entry of map) {
      iteratedEntries.push(entry);
    }
    expect(iteratedEntries).toEqual([
      [1, -7],
      [4, 'key-123'],
    ]);

    // Type checks - verify entries can be used without casting
    for (const [key, value] of map) {
      if (key === 1) {
        expectTypeOf(value).toMatchTypeOf<number>();
      } else if (key === 4) {
        expectTypeOf(value).toMatchTypeOf<string>();
      }
    }
  });
});
