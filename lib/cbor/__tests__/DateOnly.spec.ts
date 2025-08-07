import { describe, expect, it } from 'vitest';
import { decodeCbor, encodeCbor } from '../codec';
import { DateOnly } from '../DateOnly';

describe('DateOnly', () => {
  describe('constructor', () => {
    it('should create a DateOnly instance from ISO date string', () => {
      const date = new DateOnly('2024-03-20T10:00:00.000Z');
      expect(date).toBeInstanceOf(DateOnly);
      expect(date.toISOString()).toBe('2024-03-20');
    });
  });

  describe('toISOString', () => {
    it('should return date in ISO 8601 format without time component', () => {
      const date = new DateOnly('2024-03-20T10:00:00.000Z');
      expect(date.toISOString()).toBe('2024-03-20');
    });
  });

  describe('toString', () => {
    it('should return the same as toISOString', () => {
      const date = new DateOnly('2024-03-20T10:00:00.000Z');
      expect(date.toString()).toBe(date.toISOString());
    });
  });

  describe('toJSON', () => {
    it('should return the same as toISOString', () => {
      const date = new DateOnly('2024-03-20T10:00:00.000Z');
      expect(date.toJSON()).toBe(date.toISOString());
    });
  });

  describe('CBOR encoding/decoding', () => {
    it('should encode and decode DateOnly correctly', () => {
      const originalDate = new DateOnly('2024-03-20');
      const encoded = encodeCbor(originalDate);
      const decoded = decodeCbor(encoded) as DateOnly;

      expect(decoded).toBeInstanceOf(DateOnly);
      expect(decoded.toISOString()).toBe(originalDate.toISOString());
    });

    it('should handle multiple DateOnly values in an object', () => {
      const data = {
        date1: new DateOnly('2024-03-20'),
        date2: new DateOnly('2024-03-21'),
      };

      const encoded = encodeCbor(data);
      const decoded = decodeCbor(encoded) as Map<string, DateOnly>;

      expect(decoded.get('date1')).toBeInstanceOf(DateOnly);
      expect(decoded.get('date2')).toBeInstanceOf(DateOnly);
      expect(decoded.get('date1')?.toISOString()).toBe('2024-03-20');
      expect(decoded.get('date2')?.toISOString()).toBe('2024-03-21');
    });
  });
});
