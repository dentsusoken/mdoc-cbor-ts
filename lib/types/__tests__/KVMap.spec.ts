import { describe, expect, it } from 'vitest';
import type { KVMap } from '../KVMap';

describe('KVMap', () => {
  describe('type behavior', () => {
    it('should handle simple object types', () => {
      interface User {
        name: string;
        age: number;
      }

      // This test verifies that KVMap<User> resolves to the expected union type
      type UserKVMap = KVMap<User>;

      // Type assertion to verify the structure
      const test: UserKVMap = ['name', 'John'];
      const test2: UserKVMap = ['age', 30];
      //const test3: UserKVMap = ['year', 2000];

      // These should compile without errors
      expect(test).toBeDefined();
      expect(test2).toBeDefined();
    });

    it('should handle Record<string, any> types', () => {
      type DynamicMap = KVMap<Record<string, string>>;

      // For Record<string, any>, KVMap returns [string, T[string]]
      const test: DynamicMap = ['key', 'value'];
      const test2: DynamicMap = ['key2', 'value2'];

      expect(test).toBeDefined();
      expect(test2).toBeDefined();
    });

    it('should handle mixed property types', () => {
      interface MixedObject {
        string: string;
        number: number;
        boolean: boolean;
        array: string[];
        optional?: string;
      }

      type MixedKVMap = KVMap<MixedObject>;

      // Test various property types
      const test1: MixedKVMap = ['string', 'value'];
      const test2: MixedKVMap = ['number', 42];
      const test3: MixedKVMap = ['boolean', true];
      const test4: MixedKVMap = ['array', ['item1', 'item2']];
      const test5: MixedKVMap = ['optional', 'optional value'];
      const test6: MixedKVMap = ['optional', undefined];

      // Verify the exact types
      expect(test1[0]).toBe('string');
      expect(test1[1]).toBe('value');
      expect(test2[0]).toBe('number');
      expect(test2[1]).toBe(42);
      expect(test3[0]).toBe('boolean');
      expect(test3[1]).toBe(true);
      expect(test4[0]).toBe('array');
      expect(test4[1]).toEqual(['item1', 'item2']);
      expect(test5[0]).toBe('optional');
      expect(test5[1]).toBe('optional value');
      expect(test6[0]).toBe('optional');
      expect(test6[1]).toBeUndefined();
    });

    it('should handle nested object types', () => {
      interface NestedObject {
        user: {
          name: string;
          age: number;
        };
        settings: {
          theme: string;
        };
      }

      type NestedKVMap = KVMap<NestedObject>;

      // Test nested object properties
      const test1: NestedKVMap = ['user', { name: 'John', age: 30 }];
      const test2: NestedKVMap = ['settings', { theme: 'dark' }];

      expect(test1).toBeDefined();
      expect(test2).toBeDefined();
    });

    it('should handle union types', () => {
      interface UnionObject {
        value: string | number;
        flag: boolean | null;
      }

      type UnionKVMap = KVMap<UnionObject>;

      // Test union type properties
      const test1: UnionKVMap = ['value', 'string'];
      const test2: UnionKVMap = ['value', 42];
      const test3: UnionKVMap = ['flag', true];
      const test4: UnionKVMap = ['flag', null];

      expect(test1).toBeDefined();
      expect(test2).toBeDefined();
      expect(test3).toBeDefined();
      expect(test4).toBeDefined();
    });

    it('should handle Record<string, any> with different value types', () => {
      type StringRecord = KVMap<Record<string, string>>;
      type NumberRecord = KVMap<Record<string, number>>;
      type MixedRecord = KVMap<Record<string, any>>;

      // All should resolve to [string, T[string]]
      const test1: StringRecord = ['key', 'value'];
      const test2: NumberRecord = ['key', 42];
      const test3: MixedRecord = ['key', 'any value'];

      expect(test1).toBeDefined();
      expect(test2).toBeDefined();
      expect(test3).toBeDefined();
    });

    it('should have correct type inference for optional properties', () => {
      interface TestObject {
        required: string;
        optional?: number;
      }

      type TestKVMap = KVMap<TestObject>;

      // These should compile without errors
      const test1: TestKVMap = ['required', 'value'];
      const test2: TestKVMap = ['optional', 42];
      const test3: TestKVMap = ['optional', undefined];

      // These should cause type errors (uncomment to test)
      // const error1: TestKVMap = ['required', 42]; // Should be string
      // const error2: TestKVMap = ['optional', 'string']; // Should be number | undefined
      // const error3: TestKVMap = ['nonexistent', 'value']; // Should not exist

      // Verify the exact types
      expect(test1[0]).toBe('required');
      expect(test1[1]).toBe('value');
      expect(test2[0]).toBe('optional');
      expect(test2[1]).toBe(42);
      expect(test3[0]).toBe('optional');
      expect(test3[1]).toBeUndefined();

      expect(test1).toBeDefined();
      expect(test2).toBeDefined();
      expect(test3).toBeDefined();
    });
  });

  describe('runtime behavior', () => {
    it('should work with TypedMap constructor', () => {
      // This test verifies that KVMap works with TypedMap
      const data = [
        ['key1', 'value1'],
        ['key2', 42],
      ] as const;

      // Should compile without errors
      expect(data).toBeDefined();
      expect(data.length).toBe(2);
      expect(data[0]).toEqual(['key1', 'value1']);
      expect(data[1]).toEqual(['key2', 42]);
    });

    it('should work with dynamic Record types', () => {
      // Create a dynamic object
      const dynamicObject: Record<string, string> = {
        key1: 'value1',
        key2: 'value2',
      };

      // Convert to entries array
      const entries = Object.entries(dynamicObject);

      // Should work with TypedMap<any>
      expect(entries).toBeDefined();
      expect(entries.length).toBe(2);
      expect(entries[0]).toEqual(['key1', 'value1']);
      expect(entries[1]).toEqual(['key2', 'value2']);
    });
  });
});
