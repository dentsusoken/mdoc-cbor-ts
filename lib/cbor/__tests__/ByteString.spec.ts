import { describe, expect, it, expectTypeOf } from 'vitest';
import { TypedMap } from '@jfromaniello/typedmap';
import { ByteString } from '../ByteString';
import { typedMap } from '@/utils/typedMap';
import type { KVObjectToTypedMap } from '@/types';

describe('ByteString', () => {
  describe('constructor', () => {
    describe('with typedMap', () => {
      it('should create a ByteString instance with data', () => {
        const data = typedMap({ key: 'value', key2: 2 });

        const byteString = new ByteString(data);
        expect(byteString).toBeInstanceOf(ByteString);
        expect(byteString.data).toBe(data);
      });

      it('should create a ByteString instance with empty data', () => {
        const data = typedMap({});
        const byteString = new ByteString(data);
        expect(byteString).toBeInstanceOf(ByteString);
        expect(byteString.data).toBe(data);
      });

      it('should create a ByteString instance with complex data', () => {
        const data = typedMap({
          string: 'test',
          number: 42,
          boolean: true,
          array: [1, 2, 3],
          object: { nested: 'value' },
        });

        const byteString = new ByteString(data);
        expect(byteString).toBeInstanceOf(ByteString);
        expect(byteString.data).toBe(data);
      });
    });
  });

  describe('buffer property', () => {
    it('should return a Uint8Array buffer', () => {
      const data = typedMap({ key: 'value' });
      const byteString = new ByteString(data);
      expect(byteString.buffer).toBeInstanceOf(Uint8Array);
      expect(byteString.buffer.length).toBeGreaterThan(0);
    });

    it('should return different buffers for different data', () => {
      const data1 = typedMap({ key1: 'value1' });
      const data2 = typedMap({ key2: 'value2' });
      const byteString1 = new ByteString(data1);
      const byteString2 = new ByteString(data2);
      expect(byteString1.buffer).not.toEqual(byteString2.buffer);
    });

    it('should return consistent buffer for same data', () => {
      const data = typedMap({ key: 'value' });
      const byteString1 = new ByteString(data);
      const byteString2 = new ByteString(data);
      expect(byteString1.buffer).toEqual(byteString2.buffer);
    });
  });

  describe('fromBuffer', () => {
    it('should decode buffer to data', () => {
      const originalData = typedMap({ key: 'value' });
      const byteString = new ByteString(originalData);
      const decodedData = ByteString.fromBuffer(byteString.buffer);
      expect(decodedData.data).toEqual(originalData);
    });

    it('should decode buffer with empty data', () => {
      const originalData = typedMap<Record<string, never>>({});
      const byteString = new ByteString(originalData);
      const decodedData = ByteString.fromBuffer(byteString.buffer);
      expect(decodedData.data).toEqual(originalData);
    });

    it('should decode buffer with complex data', () => {
      const originalData = typedMap({
        string: 'test',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
      });
      const byteString = new ByteString(originalData);
      const decodedData = ByteString.fromBuffer<typeof originalData>(
        byteString.buffer
      );

      // Check individual properties instead of full equality
      expect(decodedData.data.get('string')).toBe('test');
      expect(decodedData.data.get('number')).toBe(42);
      expect(decodedData.data.get('boolean')).toBe(true);
      expect(decodedData.data.get('array')).toEqual([1, 2, 3]);

      // compile-time type assertions
      expectTypeOf(decodedData).toEqualTypeOf<
        ByteString<typeof originalData>
      >();
      expectTypeOf(decodedData.data.get('string')).toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf(decodedData.data.get('number')).toEqualTypeOf<
        number | undefined
      >();
      expectTypeOf(decodedData.data.get('boolean')).toEqualTypeOf<
        boolean | undefined
      >();
      expectTypeOf(decodedData.data.get('array')).toEqualTypeOf<
        number[] | undefined
      >();
      // Nested object value must be a TypedMap of its shape
      expectTypeOf(decodedData.data.get('object')).toEqualTypeOf<
        TypedMap<KVObjectToTypedMap<{ nested: string }>> | undefined
      >();
    });
  });
});
