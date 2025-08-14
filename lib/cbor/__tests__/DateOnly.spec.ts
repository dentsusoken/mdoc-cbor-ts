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

    describe('invalid CBOR data with Tag(1004)', () => {
      it('should handle CBOR tag 1004 with number 42 (milliseconds since epoch)', () => {
        // 0xd9 0x03 0xec = tag(1004); 0x18 0x2a = 42
        const data = new Uint8Array([0xd9, 0x03, 0xec, 0x18, 0x2a]);
        const result = decodeCbor(data) as DateOnly;
        expect(result).toBeInstanceOf(DateOnly);
        expect(result.getTime()).toBe(42);
        expect(result.toISOString()).toBe('1970-01-01');
      });

      it('should handle CBOR tag 1004 with boolean true', () => {
        // 0xd9 0x03 0xec = tag(1004); 0xf5 = true
        const data = new Uint8Array([0xd9, 0x03, 0xec, 0xf5]);
        const result = decodeCbor(data) as DateOnly;
        expect(result).toBeInstanceOf(DateOnly);
        expect(result.getTime()).toBe(1);
        expect(result.toISOString()).toBe('1970-01-01');
      });

      it('should handle CBOR tag 1004 with null', () => {
        // 0xd9 0x03 0xec = tag(1004); 0xf6 = null
        const data = new Uint8Array([0xd9, 0x03, 0xec, 0xf6]);
        const result = decodeCbor(data) as DateOnly;
        expect(result).toBeInstanceOf(DateOnly);
        expect(result.getTime()).toBe(0);
        expect(result.toISOString()).toBe('1970-01-01');
      });

      it('should handle CBOR tag 1004 with empty string', () => {
        // 0xd9 0x03 0xec = tag(1004); 0x60 = ""
        const data = new Uint8Array([0xd9, 0x03, 0xec, 0x60]);
        const result = decodeCbor(data) as DateOnly;
        expect(result).toBeInstanceOf(DateOnly);
        expect(() => result.toISOString()).toThrow(
          new RangeError('Invalid time value')
        );
      });

      it('should handle CBOR tag 1004 with invalid string "invalid-date"', () => {
        // 0xd9 0x03 0xec = tag(1004); text(12) "invalid-date"
        const data = new Uint8Array([
          0xd9, 0x03, 0xec, 0x6c, 0x69, 0x6e, 0x76, 0x61, 0x6c, 0x69, 0x64,
          0x2d, 0x64, 0x61, 0x74, 0x65,
        ]);
        const result = decodeCbor(data) as DateOnly;
        expect(result).toBeInstanceOf(DateOnly);
        expect(() => result.toISOString()).toThrow(
          new RangeError('Invalid time value')
        );
      });

      it('should handle CBOR tag 1004 with array [1,2,3]', () => {
        // 0xd9 0x03 0xec = tag(1004); array(3) [1,2,3]
        const data = new Uint8Array([0xd9, 0x03, 0xec, 0x83, 0x01, 0x02, 0x03]);
        const result = decodeCbor(data) as DateOnly;
        expect(result).toBeInstanceOf(DateOnly);
        // Library coerces to some date; assert exact observed behavior deterministically
        // Reuse JS Date to compute canonical ms and ISO date (no time in DateOnly)
        const expectedMs = new Date('2003-01-01T15:00:00.000Z').getTime();
        expect(result.getTime()).toBe(expectedMs);
        expect(result.toISOString()).toBe('2003-01-01');
      });

      it('should handle nested CBOR tag 1004 with number 42 in an object', () => {
        // { "date": tag(1004) 42 }
        const data = new Uint8Array([
          0xa1, // map(1)
          0x64,
          0x64,
          0x61,
          0x74,
          0x65, // "date"
          0xd9,
          0x03,
          0xec, // tag(1004)
          0x18,
          0x2a, // 42
        ]);
        const result = decodeCbor(data) as Map<string, DateOnly>;
        const value = result.get('date') as DateOnly;
        expect(value).toBeInstanceOf(DateOnly);
        expect(value.getTime()).toBe(42);
        expect(value.toISOString()).toBe('1970-01-01');
      });
    });
  });
});
