import { describe, expect, it } from 'vitest';
import { ByteString } from './ByteString';
import { decode, encode } from './index';

describe('ByteString', () => {
  describe('constructor', () => {
    it('should create a ByteString instance with data', () => {
      const data = { key: 'value' };
      const byteString = new ByteString(data);
      expect(byteString).toBeInstanceOf(ByteString);
      expect(byteString.data).toBe(data);
    });
  });

  describe('fromBuffer', () => {
    it('should decode buffer to data', () => {
      const originalData = { key: 'value' };
      const buffer = Buffer.from(encode(originalData));
      const decodedData = ByteString.fromBuffer(buffer);
      expect(decodedData.data).toEqual(originalData);
    });
  });

  describe('CBOR encoding/decoding', () => {
    it('should encode and decode ByteString correctly', () => {
      const originalData = { key: 'value' };
      const byteString = new ByteString(originalData);
      const encoded = encode(byteString);
      console.log('encoded :>> ', encoded.toString('base64url'));
      const decoded = decode(encoded) as ByteString;

      expect(decoded).toBeInstanceOf(ByteString);
      expect(decoded.data).toEqual(originalData);
    });

    it('should handle different data types', () => {
      const testCases = [
        { key: 'value' },
        [1, 2, 3],
        'string',
        123,
        true,
        null,
        undefined,
      ];

      testCases.forEach((data) => {
        const byteString = new ByteString(data);
        const encoded = encode(byteString);
        const decoded = decode(encoded) as ByteString;

        expect(decoded).toBeInstanceOf(ByteString);
        expect(decoded.data).toEqual(data);
      });
    });

    it('should handle nested data structures', () => {
      const data = {
        array: [1, 2, 3],
        object: {
          nested: {
            value: 'test',
          },
        },
      };

      const byteString = new ByteString(data);
      const encoded = encode(byteString);
      const decoded = decode(encoded) as ByteString;

      expect(decoded).toBeInstanceOf(ByteString);
      expect(decoded.data).toEqual(data);
    });

    it('should handle multiple ByteString values in an object', () => {
      const data = {
        bytes1: new ByteString({ key1: 'value1' }),
        bytes2: new ByteString({ key2: 'value2' }),
      };

      const encoded = encode(data);
      const decoded = decode(encoded) as {
        bytes1: ByteString;
        bytes2: ByteString;
      };

      expect(decoded.bytes1).toBeInstanceOf(ByteString);
      expect(decoded.bytes2).toBeInstanceOf(ByteString);
      expect(decoded.bytes1.data).toEqual({ key1: 'value1' });
      expect(decoded.bytes2.data).toEqual({ key2: 'value2' });
    });
  });
});
