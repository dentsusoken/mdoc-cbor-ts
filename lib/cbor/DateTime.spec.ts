import { describe, expect, it } from 'vitest';
import { decode, encode } from '../cbor';
import { DateTime } from './DateTime';

describe('DateTime', () => {
  describe('constructor', () => {
    it('should create a DateTime instance from ISO date-time string', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00Z');
      expect(dateTime).toBeInstanceOf(DateTime);
      expect(dateTime.toISOString()).toBe('2024-03-20T15:30:00Z');
    });
  });

  describe('toISOString', () => {
    it('should return date-time in ISO 8601 format without milliseconds', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00.123Z');
      expect(dateTime.toISOString()).toBe('2024-03-20T15:30:00Z');
    });

    it('should handle different timezone offsets', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00+09:00');
      expect(dateTime.toISOString()).toBe('2024-03-20T06:30:00Z');
    });
  });

  describe('toString', () => {
    it('should return the same as toISOString', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00Z');
      expect(dateTime.toString()).toBe(dateTime.toISOString());
    });
  });

  describe('toJSON', () => {
    it('should return the same as toISOString', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00Z');
      expect(dateTime.toJSON()).toBe(dateTime.toISOString());
    });
  });

  describe('CBOR encoding/decoding', () => {
    it('should encode and decode DateTime correctly', () => {
      const originalDateTime = new DateTime('2024-03-20T15:30:00Z');
      const encoded = encode(originalDateTime);
      const decoded = decode(encoded) as DateTime;

      console.log('encoded :>> ', encoded.toString('base64url'));

      expect(decoded).toBeInstanceOf(DateTime);
      expect(decoded.toISOString()).toBe(originalDateTime.toISOString());
    });

    it('should handle multiple DateTime values in an object', () => {
      const data = {
        dateTime1: new DateTime('2024-03-20T15:30:00Z'),
        dateTime2: new DateTime('2024-03-21T16:45:00Z'),
      };

      const encoded = encode(data);
      const decoded = decode(encoded) as Map<any, any>;

      expect(decoded.get('dateTime1')).toBeInstanceOf(DateTime);
      expect(decoded.get('dateTime2')).toBeInstanceOf(DateTime);
      expect(decoded.get('dateTime1').toISOString()).toBe(
        '2024-03-20T15:30:00Z'
      );
      expect(decoded.get('dateTime2').toISOString()).toBe(
        '2024-03-21T16:45:00Z'
      );
    });
  });
});
