import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { ByteString } from './ByteString';
import { decode, encode } from './index';

describe('ByteString', () => {
  describe('constructor', () => {
    it('should create a ByteString instance with data', () => {
      const data = new TypedMap<[string, any]>([['key', 'value']]);
      const byteString = new ByteString(data);
      expect(byteString).toBeInstanceOf(ByteString);
      expect(byteString.data).toBe(data);
    });
  });

  describe('fromBuffer', () => {
    it('should decode buffer to data', () => {
      // const originalData = { key: 'value' };
      const originalData = new TypedMap<[string, any]>([['key', 'value']]);

      const buffer = Buffer.from(encode(originalData));
      const decodedData = ByteString.fromBuffer(buffer);
      expect(decodedData.data).toEqual(originalData);
    });
  });

  describe('CBOR encoding/decoding', () => {
    it('should encode and decode ByteString correctly', () => {
      // const originalData = { key: 'value' };
      const originalData = new TypedMap<[string, any]>([['key', 'value']]);
      const byteString = new ByteString(originalData);
      const encoded = encode(byteString);
      console.log('encoded :>> ', encoded.toString('base64url'));
      const decoded = decode(encoded) as ByteString<TypedMap<[string, any]>>;

      expect(decoded).toBeInstanceOf(ByteString);
      expect(decoded.data).toEqual(originalData);
    });
  });
});
