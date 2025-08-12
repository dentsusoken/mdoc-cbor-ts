/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it, expectTypeOf } from 'vitest';
import { KVObjectToTypedMap } from '@/types';

describe('KVObjectToTypedMap', () => {
  describe('type behavior', () => {
    it('should handle simple object types', () => {
      interface SimpleObject {
        name: string;
        age: number;
      }

      type SimpleKVObjectToTypeMap = KVObjectToTypedMap<SimpleObject>;

      // These should compile without errors
      const test1: SimpleKVObjectToTypeMap = ['name', 'John'];
      const test2: SimpleKVObjectToTypeMap = ['age', 30];

      expect(test1).toBeDefined();
      expect(test2).toBeDefined();
    });

    it('should handle Record<string, any> types', () => {
      type RecordKVObjectToTypeMap = KVObjectToTypedMap<Record<string, any>>;
      const test: RecordKVObjectToTypeMap = ['key', 'value'];

      // Test that it works with any string key and any value
      const test1: RecordKVObjectToTypeMap = ['anyKey', 'stringValue'];
      const test2: RecordKVObjectToTypeMap = ['anotherKey', 42];
      const test3: RecordKVObjectToTypeMap = ['booleanKey', true];

      expect(test).toBeDefined();
      expect(test1).toBeDefined();
      expect(test2).toBeDefined();
      expect(test3).toBeDefined();
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

      type NestedKVObjectToTypeMap = KVObjectToTypedMap<NestedObject>;

      // Test nested object properties
      const test1: NestedKVObjectToTypeMap = [
        'user',
        new TypedMap([
          ['name', 'John'],
          ['age', 30],
        ]),
      ];
      const test2: NestedKVObjectToTypeMap = [
        'settings',
        new TypedMap([['theme', 'dark']]),
      ];

      expect(test1).toBeDefined();
      expect(test2).toBeDefined();
    });

    it('should handle array values', () => {
      interface ArrayObject {
        tags: string[];
        scores: number[];
      }

      type ArrayKVObjectToTypeMap = KVObjectToTypedMap<ArrayObject>;

      // Test array properties
      const test1: ArrayKVObjectToTypeMap = ['tags', ['tag1', 'tag2']];
      const test2: ArrayKVObjectToTypeMap = ['scores', [85, 92, 78]];

      expect(test1).toBeDefined();
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

      type MixedKVObjectToTypeMap = KVObjectToTypedMap<MixedObject>;

      // Test various property types
      const test1: MixedKVObjectToTypeMap = ['string', 'value'];
      const test2: MixedKVObjectToTypeMap = ['number', 42];
      const test3: MixedKVObjectToTypeMap = ['boolean', true];
      const test4: MixedKVObjectToTypeMap = ['array', ['item1', 'item2']];
      const test5: MixedKVObjectToTypeMap = ['optional', 'optional value'];
      const test6: MixedKVObjectToTypeMap = ['optional', undefined];

      expect(test1).toBeDefined();
      expect(test2).toBeDefined();
      expect(test3).toBeDefined();
      expect(test4).toBeDefined();
      expect(test5).toBeDefined();
      expect(test6).toBeDefined();
    });
  });

  describe('runtime behavior', () => {
    it('should build a proper TypedMap for the given Example shape', () => {
      interface Example {
        aaa: number;
        bbb: boolean;
        ccc: number[];
        ddd: {
          ddd1: number;
          ddd2: boolean;
        };
      }

      const map = new TypedMap<KVObjectToTypedMap<Example>>([
        ['aaa', 10],
        ['bbb', true],
        ['ccc', [1, 2, 3]],
        [
          'ddd',
          new TypedMap<KVObjectToTypedMap<Example['ddd']>>([
            ['ddd1', 5],
            ['ddd2', false],
          ]),
        ],
      ]);

      // runtime checks
      expect(map.get('aaa')).toBe(10);
      expect(map.get('bbb')).toBe(true);
      expect(map.get('ccc')).toEqual([1, 2, 3]);
      const ddd = map.get('ddd');
      expect(ddd).toBeInstanceOf(TypedMap);
      const dddMap = ddd as TypedMap<KVObjectToTypedMap<Example['ddd']>>;
      expect(dddMap.get('ddd1')).toBe(5);
      expect(dddMap.get('ddd2')).toBe(false);

      // compile-time checks
      expectTypeOf(map).toEqualTypeOf<TypedMap<KVObjectToTypedMap<Example>>>();
    });
    it('should work with TypedMap constructor', () => {
      interface TestObject {
        name: string;
        age: number;
        address: {
          city: string;
          country: string;
        };
      }

      const data = new TypedMap<KVObjectToTypedMap<TestObject>>([
        ['name', 'John'],
        ['age', 30],
        [
          'address',
          new TypedMap([
            ['city', 'Tokyo'],
            ['country', 'Japan'],
          ]),
        ],
      ]);

      expect(data.get('name')).toBe('John');
      expect(data.get('age')).toBe(30);
      expect(data.get('address')).toBeInstanceOf(TypedMap);
    });

    it('should work with dynamic Record types', () => {
      const data = new TypedMap<KVObjectToTypedMap<Record<string, string>>>([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);

      expect(data.get('key1')).toBe('value1');
      expect(data.get('key2')).toBe('value2');
    });
  });
});
