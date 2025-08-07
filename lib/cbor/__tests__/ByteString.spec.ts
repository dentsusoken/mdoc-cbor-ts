import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { ByteString } from '../ByteString';
import { KVMap } from '@/types/KVMap';
import { KVObjectToTypedMap } from '../../types/KVObjectToTypedMap';

describe('ByteString', () => {
  describe('constructor', () => {
    describe('with KVMap', () => {
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
        const data = new TypedMap<KVMap<EmptyDataType>>([]);
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
        const data = new TypedMap<KVObjectToTypedMap<ComplexDataType>>([
          ['string', 'test'],
          ['number', 42],
          ['boolean', true],
          ['array', [1, 2, 3]],
          ['object', new TypedMap([['nested', 'value']])],
        ]);

        const byteString = new ByteString(data);
        expect(byteString).toBeInstanceOf(ByteString);
        expect(byteString.data).toBe(data);
      });
    });

    describe('with KVObjectToTypeMap', () => {
      it('should create a ByteString instance with data', () => {
        type DataType = {
          key: string;
          key2: number;
        };
        const data = new TypedMap<KVObjectToTypedMap<DataType>>([
          ['key', 'value'],
          ['key2', 2],
        ]);

        const byteString = new ByteString(data);
        expect(byteString).toBeInstanceOf(ByteString);
        expect(byteString.data).toBe(data);
      });

      it('should create a ByteString instance with empty data', () => {
        type EmptyDataType = Record<string, never>;
        const data = new TypedMap<KVObjectToTypedMap<EmptyDataType>>([]);
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
        const data = new TypedMap<KVObjectToTypedMap<ComplexDataType>>([
          ['string', 'test'],
          ['number', 42],
          ['boolean', true],
          ['array', [1, 2, 3]],
          ['object', new TypedMap([['nested', 'value']])],
        ]);

        const byteString = new ByteString(data);
        expect(byteString).toBeInstanceOf(ByteString);
        expect(byteString.data).toBe(data);
      });
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
      const data1 = new TypedMap<KVMap<DataType1>>([['key1', 'value1']]);
      const data2 = new TypedMap<KVMap<DataType2>>([['key2', 'value2']]);
      const byteString1 = new ByteString(data1);
      const byteString2 = new ByteString(data2);
      expect(byteString1.buffer).not.toEqual(byteString2.buffer);
    });

    it('should return consistent buffer for same data', () => {
      type DataType = { key: string };
      const data = new TypedMap<KVMap<DataType>>([['key', 'value']]);
      const byteString1 = new ByteString(data);
      const byteString2 = new ByteString(data);
      expect(byteString1.buffer).toEqual(byteString2.buffer);
    });
  });

  describe('fromBuffer', () => {
    it('should decode buffer to data', () => {
      type DataType = { key: string };
      const originalData = new TypedMap<KVMap<DataType>>([['key', 'value']]);
      const byteString = new ByteString(originalData);
      const decodedData = ByteString.fromBuffer(byteString.buffer);
      expect(decodedData.data).toEqual(originalData);
    });

    it('should decode buffer with empty data', () => {
      type EmptyDataType = Record<string, never>;
      const originalData = new TypedMap<KVMap<EmptyDataType>>([]);
      const byteString = new ByteString(originalData);
      const decodedData = ByteString.fromBuffer(byteString.buffer);
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
        TypedMap<KVObjectToTypedMap<ComplexDataType>>
      >(byteString.buffer);

      // Check individual properties instead of full equality
      expect(decodedData.data.get('string')).toBe('test');
      expect(decodedData.data.get('number')).toBe(42);
      expect(decodedData.data.get('boolean')).toBe(true);
      expect(decodedData.data.get('array')).toEqual([1, 2, 3]);

      // cbor-x returns Map for objects, so we need to check the Map structure
      const objectValue = decodedData.data.get('object');
      expect(objectValue).toBeInstanceOf(Map);
      expect(objectValue?.get('nested')).toBe('value');
    });
  });
});
