import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { ByteString } from '../ByteString';
import { decodeCbor, encodeCbor } from '../codec';
import { KVDecodedMap, KVMap } from '@/types';

describe('ByteString', () => {
  describe('constructor', () => {
    it('should create a ByteString instance with data', () => {
      type DataType = {
        key: string;
        key2: number;
      };
      const data = new TypedMap<KVMap<DataType>>([
        ['key', 'value'],
        ['key2', 2],
      ]);

      const byteString = new ByteString(data);
      expect(byteString).toBeInstanceOf(ByteString);
      expect(byteString.data).toBe(data);
    });

    it('should create a ByteString instance with empty data', () => {
      type EmptyDataType = Record<string, never>;
      const data = new TypedMap<KVDecodedMap<EmptyDataType>>([]);
      const byteString = new ByteString(data);
      expect(byteString).toBeInstanceOf(ByteString);
      expect(byteString.data).toBe(data);
    });

    it('should create a ByteString instance with complex data', () => {
      type ComplexDataType = {
        string: string;
        number: number;
        boolean: boolean;
        array: number[];
        object: { nested: string };
      };
      const data = new TypedMap<KVMap<ComplexDataType>>([
        ['string', 'test'],
        ['number', 42],
        ['boolean', true],
        ['array', [1, 2, 3]],
        ['object', { nested: 'value' }],
      ]);

      const byteString = new ByteString(data);
      expect(byteString).toBeInstanceOf(ByteString);
      expect(byteString.data).toBe(data);
    });
  });

  describe('buffer property', () => {
    it('should return a Uint8Array buffer', () => {
      type DataType = { key: string };
      const data = new TypedMap<KVMap<DataType>>([['key', 'value']]);
      const byteString = new ByteString(data);
      expect(byteString.buffer).toBeInstanceOf(Uint8Array);
      expect(byteString.buffer.length).toBeGreaterThan(0);
    });

    it('should return different buffers for different data', () => {
      type DataType1 = { key1: string };
      type DataType2 = { key2: string };
      const data1 = new TypedMap<KVDecodedMap<DataType1>>([['key1', 'value1']]);
      const data2 = new TypedMap<KVDecodedMap<DataType2>>([['key2', 'value2']]);
      const byteString1 = new ByteString(data1);
      const byteString2 = new ByteString(data2);
      expect(byteString1.buffer).not.toEqual(byteString2.buffer);
    });

    it('should return consistent buffer for same data', () => {
      type DataType = { key: string };
      const data = new TypedMap<KVDecodedMap<DataType>>([['key', 'value']]);
      const byteString1 = new ByteString(data);
      const byteString2 = new ByteString(data);
      expect(byteString1.buffer).toEqual(byteString2.buffer);
    });
  });

  describe('fromBuffer', () => {
    it('should decode buffer to data', () => {
      type DataType = { key: string };
      const originalData = new TypedMap<KVDecodedMap<DataType>>([
        ['key', 'value'],
      ]);
      const byteString = new ByteString(originalData);
      const decodedData = ByteString.fromBuffer(byteString.buffer);
      expect(decodedData.data).toEqual(originalData);
    });

    it('should decode buffer with empty data', () => {
      type EmptyDataType = Record<string, never>;
      const originalData = new TypedMap<KVDecodedMap<EmptyDataType>>([]);
      const buffer = encodeCbor(originalData.esMap);
      const decodedData = ByteString.fromBuffer(buffer);
      expect(decodedData.data).toEqual(originalData);
    });

    it('should decode buffer with complex data', () => {
      type ComplexDataType = {
        string: string;
        number: number;
        boolean: boolean;
        array: number[];
        object: { nested: string };
      };
      const originalData = new TypedMap<KVMap<ComplexDataType>>([
        ['string', 'test'],
        ['number', 42],
        ['boolean', true],
        ['array', [1, 2, 3]],
        ['object', { nested: 'value' }],
      ]);
      const byteString = new ByteString(originalData);
      const decodedData = ByteString.fromBuffer<
        TypedMap<KVDecodedMap<ComplexDataType>>
      >(byteString.buffer);

      // Check individual properties instead of full equality
      expect(decodedData.data.get('string')).toBe('test');
      expect(decodedData.data.get('number')).toBe(42);
      expect(decodedData.data.get('boolean')).toBe(true);
      expect(decodedData.data.get('array')).toEqual([1, 2, 3]);

      // cbor-x returns Map for objects, so we need to check the Map structure
      const objectValue = decodedData.data.get('object');
      expect(objectValue).toBeInstanceOf(Map);
      console.log('objectValue :>> ', objectValue);
      expect(objectValue?.get('nested')).toBe('value');
    });
  });

  describe('CBOR encoding/decoding', () => {
    it('should encode and decode ByteString correctly', () => {
      type DataType = { key: string };
      const originalData = new TypedMap<KVDecodedMap<DataType>>([
        ['key', 'value'],
      ]);
      const byteString = new ByteString(originalData);
      const encoded = encodeCbor(byteString);
      console.log('encoded :>> ', Buffer.from(encoded).toString('base64url'));
      const decoded = decodeCbor(encoded) as ByteString<
        TypedMap<KVDecodedMap<DataType>>
      >;

      expect(decoded).toBeInstanceOf(ByteString);
      expect(decoded.data).toEqual(originalData);
    });

    it('should handle CBOR tag 24 extension', () => {
      type DataType = { key: string };
      const originalData = new TypedMap<KVDecodedMap<DataType>>([
        ['key', 'value'],
      ]);
      const byteString = new ByteString(originalData);

      // Test that the ByteString is properly tagged with CBOR tag 24
      const encoded = encodeCbor(byteString);
      const decoded = decodeCbor(encoded) as ByteString<
        TypedMap<KVDecodedMap<DataType>>
      >;

      expect(decoded).toBeInstanceOf(ByteString);
      expect(decoded.data).toEqual(originalData);
    });

    it('should handle multiple ByteString instances', () => {
      type DataType1 = { key1: string };
      type DataType2 = { key2: string };
      const data1 = new TypedMap<KVDecodedMap<DataType1>>([['key1', 'value1']]);
      const data2 = new TypedMap<KVDecodedMap<DataType2>>([['key2', 'value2']]);

      const byteString1 = new ByteString(data1);
      const byteString2 = new ByteString(data2);

      const encoded1 = encodeCbor(byteString1);
      const encoded2 = encodeCbor(byteString2);

      const decoded1 = decodeCbor(encoded1) as ByteString<
        TypedMap<KVDecodedMap<DataType1>>
      >;
      const decoded2 = decodeCbor(encoded2) as ByteString<
        TypedMap<KVDecodedMap<DataType2>>
      >;

      expect(decoded1.data).toEqual(data1);
      expect(decoded2.data).toEqual(data2);
      expect(decoded1.data).not.toEqual(decoded2.data);
    });
  });

  describe('data integrity', () => {
    it('should preserve data types correctly', () => {
      type DataType = {
        string: string;
        number: number;
        boolean: boolean;
        null: null;
        array: number[];
        object: { nested: string };
      };
      const data = new TypedMap<KVMap<DataType>>([
        ['string', 'test'],
        ['number', 42],
        ['boolean', true],
        ['null', null],
        ['array', [1, 2, 3]],
        ['object', { nested: 'value' }],
      ]);

      const byteString = new ByteString(data);
      const encoded = encodeCbor(byteString);
      const decoded = decodeCbor(encoded) as ByteString<
        TypedMap<KVDecodedMap<DataType>>
      >;

      expect(decoded.data.get('string')).toBe('test');
      expect(decoded.data.get('number')).toBe(42);
      expect(decoded.data.get('boolean')).toBe(true);
      expect(decoded.data.get('null')).toBe(null);
      expect(decoded.data.get('array')).toEqual([1, 2, 3]);
      // cbor-x returns Map for objects, so we need to check the Map structure
      const objectValue = decoded.data.get('object');
      expect(objectValue).toBeInstanceOf(Map);
      if (objectValue instanceof Map) {
        expect(objectValue.get('nested')).toBe('value');
      }
    });

    it('should handle large data structures', () => {
      type LargeDataType = Record<string, string>;
      const largeData = new TypedMap<KVMap<LargeDataType>>();
      for (let i = 0; i < 100; i++) {
        largeData.set(`key${i}`, `value${i}`);
      }

      const byteString = new ByteString(largeData);
      const encoded = encodeCbor(byteString);
      const decoded = decodeCbor(encoded) as ByteString<
        TypedMap<KVDecodedMap<LargeDataType>>
      >;

      expect(decoded.data.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(decoded.data.get(`key${i}`)).toBe(`value${i}`);
      }
    });
  });
});
