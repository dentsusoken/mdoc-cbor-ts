import { decode, encode } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { DateOnly } from './DateOnly';

describe('DateOnly', () => {
  describe('constructor', () => {
    it('should create a DateOnly instance from ISO date string', () => {
      const date = new DateOnly('2024-03-20');
      expect(date).toBeInstanceOf(DateOnly);
      expect(date.toISOString()).toBe('2024-03-20');
    });
  });

  describe('toISOString', () => {
    it('should return date in ISO 8601 format without time component', () => {
      const date = new DateOnly('2024-03-20');
      expect(date.toISOString()).toBe('2024-03-20');
    });
  });

  describe('toString', () => {
    it('should return the same as toISOString', () => {
      const date = new DateOnly('2024-03-20');
      expect(date.toString()).toBe(date.toISOString());
    });
  });

  describe('toJSON', () => {
    it('should return the same as toISOString', () => {
      const date = new DateOnly('2024-03-20');
      expect(date.toJSON()).toBe(date.toISOString());
    });
  });

  describe('CBOR encoding/decoding', () => {
    it('should encode and decode DateOnly correctly', () => {
      const originalDate = new DateOnly('2024-03-20');
      const encoded = encode(originalDate);
      const decoded = decode(encoded);

      console.log('encoded :>> ', encoded.toString('base64url'));

      expect(decoded).toBeInstanceOf(DateOnly);
      expect(decoded.toISOString()).toBe(originalDate.toISOString());
    });

    it('should handle multiple DateOnly values in an object', () => {
      const data = {
        date1: new DateOnly('2024-03-20'),
        date2: new DateOnly('2024-03-21'),
      };

      const encoded = encode(data);
      const decoded = decode(encoded);

      expect(decoded.date1).toBeInstanceOf(DateOnly);
      expect(decoded.date2).toBeInstanceOf(DateOnly);
      expect(decoded.date1.toISOString()).toBe('2024-03-20');
      expect(decoded.date2.toISOString()).toBe('2024-03-21');
    });
  });
});
