import { describe, expect, it } from 'vitest';
import { TypedMap } from '@jfromaniello/typedmap';
import { KVDecodedMap, KVMap } from './index';
import { encodeCbor, decodeCbor } from '@/cbor/codec';

describe('types', () => {
  describe('KVMap', () => {
    it('should convert simple object type to key-value tuples', () => {
      type SimpleType = { name: string; age: number };
      type Result = KVMap<SimpleType>;

      // Type assertion to verify the result
      const _test: Result = ['name', 'John'];
      expect(_test).toEqual(['name', 'John']);
    });

    it('should handle empty object type', () => {
      type EmptyType = Record<string, never>;
      type Result = KVMap<EmptyType>;

      // Should be never for empty object
      const _test: Result = [] as never as Result;
      expect(_test).toEqual([]);
    });
  });

  describe('KVDecodedMap', () => {
    it('should convert simple object type to TypedMap type', () => {
      type SimpleType = { name: string; age: number };
      type Result = KVDecodedMap<SimpleType>;

      // Should be ["name", string] | ["age", number]
      const data = new TypedMap<Result>([
        ['name', 'John'],
        ['age', 30],
      ]);

      expect(data.get('name')).toBe('John');
      expect(data.get('age')).toBe(30);
    });

    it('should handle nested object types recursively', () => {
      type NestedType = {
        level1: { level2: string };
      };
      type Result = KVDecodedMap<NestedType>;

      // Should be ["level1", TypedMap<["level2", string]>]
      const nestedData = new TypedMap<KVMap<{ level2: string }>>([
        ['level2', 'value'],
      ]);

      const data = new TypedMap<Result>([['level1', nestedData]]);

      expect(data.get('level1')).toBe(nestedData);
      expect(
        (data.get('level1') as TypedMap<KVMap<{ level2: string }>>).get(
          'level2'
        )
      ).toBe('value');
    });

    it('should handle nested structures using cbor round trip', () => {
      type NestedType = {
        level1: {
          level2: string;
        };
      };
      type InputMap = KVMap<NestedType>;
      type DecodedMap = KVDecodedMap<NestedType>;

      const data = new TypedMap<InputMap>([['level1', { level2: 'value' }]]);
      const encoded = encodeCbor(data.esMap);
      const decoded = decodeCbor(encoded) as Iterable<DecodedMap>;
      const decoddedMap = new TypedMap<DecodedMap>(decoded);

      const level1 = decoddedMap.get('level1');
      expect(level1).toBeDefined();
      const level2 = level1?.get('level2');
      expect(level2).toBe('value');
    });

    it('should handle complex nested structures with CBOR round-trip', () => {
      type ComplexType = {
        user: {
          name: string;
          address: {
            city: string;
            country: string;
          };
        };
        settings: {
          theme: string;
        };
      };
      type InputMap = KVMap<ComplexType>;
      type DecodedMap = KVDecodedMap<ComplexType>;

      // Input: Use KVMap for object-based structure
      const inputData = new TypedMap<InputMap>([
        [
          'user',
          { name: 'John', address: { city: 'Tokyo', country: 'Japan' } },
        ],
        ['settings', { theme: 'dark' }],
      ]);

      // Encode and decode
      const encoded = encodeCbor(inputData.esMap);
      const decoded = decodeCbor(encoded) as Iterable<DecodedMap>;
      const decodedData = new TypedMap<DecodedMap>(decoded);

      // Verify the structure after CBOR round-trip
      const user = decodedData.get('user');
      expect(user).toBeDefined();
      expect(user?.get('name')).toBe('John');

      const address = user?.get('address');
      expect(address).toBeDefined();
      expect(address?.get('city')).toBe('Tokyo');
      expect(address?.get('country')).toBe('Japan');

      const settings = decodedData.get('settings');
      expect(settings).toBeDefined();
      expect(settings?.get('theme')).toBe('dark');
    });

    it('should handle non-object types without conversion', () => {
      type StringType = string;
      type Result = KVDecodedMap<StringType>;

      // Should remain string, not converted
      const _test: Result = 'test' as Result;
      expect(_test).toBe('test');
    });

    it('should handle empty object type', () => {
      type EmptyType = Record<string, never>;
      type Result = KVDecodedMap<EmptyType>;

      const data = new TypedMap<Result>([]);
      expect(data.size).toBe(0);
    });

    it('should handle primitive values in object', () => {
      type MixedType = {
        string: string;
        number: number;
        boolean: boolean;
        null: null;
        undefined: undefined;
      };
      type Result = KVDecodedMap<MixedType>;

      const data = new TypedMap<Result>([
        ['string', 'test'],
        ['number', 42],
        ['boolean', true],
        ['null', null],
        ['undefined', undefined],
      ]);

      expect(data.get('string')).toBe('test');
      expect(data.get('number')).toBe(42);
      expect(data.get('boolean')).toBe(true);
      expect(data.get('null')).toBe(null);
      expect(data.get('undefined')).toBe(undefined);
    });

    it('should handle array values in object', () => {
      type ArrayType = {
        numbers: number[];
        strings: string[];
        mixed: (string | number)[];
      };
      type Result = KVDecodedMap<ArrayType>;

      // Arrays should remain as arrays, not converted to TypedMap
      const data = new TypedMap<Result>([
        ['numbers', [1, 2, 3]],
        ['strings', ['a', 'b', 'c']],
        ['mixed', ['a', 1, 'b', 2]],
      ]);

      expect(data.get('numbers')).toEqual([1, 2, 3]);
      expect(data.get('strings')).toEqual(['a', 'b', 'c']);
      expect(data.get('mixed')).toEqual(['a', 1, 'b', 2]);
    });

    it('should handle deep nesting', () => {
      type DeepNestedType = {
        level1: {
          level2: {
            level3: {
              level4: string;
            };
          };
        };
      };
      type Result = KVDecodedMap<DeepNestedType>;

      // Create deeply nested structure
      const level4Data = new TypedMap<KVMap<{ level4: string }>>([
        ['level4', 'deep value'],
      ]);

      const level3Data = new TypedMap<
        KVMap<{ level3: TypedMap<KVMap<{ level4: string }>> }>
      >([['level3', level4Data]]);

      const level2Data = new TypedMap<
        KVMap<{
          level2: TypedMap<
            KVMap<{ level3: TypedMap<KVMap<{ level4: string }>> }>
          >;
        }>
      >([['level2', level3Data]]);

      const data = new TypedMap<Result>([['level1', level2Data]]);

      // Navigate through the nested structure
      const level1 = data.get('level1') as TypedMap<
        KVMap<{
          level2: TypedMap<
            KVMap<{ level3: TypedMap<KVMap<{ level4: string }>> }>
          >;
        }>
      >;
      const level2 = level1.get('level2') as TypedMap<
        KVMap<{ level3: TypedMap<KVMap<{ level4: string }>> }>
      >;
      const level3 = level2.get('level3') as TypedMap<
        KVMap<{ level4: string }>
      >;
      const level4 = level3.get('level4');

      expect(level4).toBe('deep value');
    });
  });
});
