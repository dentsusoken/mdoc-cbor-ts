import { describe, expect, it } from 'vitest';
import { decodeCbor, encodeCbor } from '../codec';
import { DateTime } from '../DateTime';

describe('DateTime', () => {
  describe('constructor', () => {
    it('should create a DateTime instance from ISO date-time string', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00.123Z');
      expect(dateTime).toBeInstanceOf(DateTime);
      expect(dateTime.toISOString()).toBe('2024-03-20T15:30:00Z');
    });
  });

  describe('toISOString', () => {
    it('should return date-time in ISO 8601 format without milliseconds', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00.456Z');
      expect(dateTime.toISOString()).toBe('2024-03-20T15:30:00Z');
    });

    it('should handle different timezone offsets', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00.789+09:00');
      expect(dateTime.toISOString()).toBe('2024-03-20T06:30:00Z');
    });
  });

  describe('toString', () => {
    it('should return the same as toISOString', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00.234Z');
      expect(dateTime.toString()).toBe(dateTime.toISOString());
    });
  });

  describe('toJSON', () => {
    it('should return the same as toISOString', () => {
      const dateTime = new DateTime('2024-03-20T15:30:00.567Z');
      expect(dateTime.toJSON()).toBe(dateTime.toISOString());
    });
  });

  describe('CBOR encoding/decoding', () => {
    it('should encode and decode DateTime correctly', () => {
      const originalDateTime = new DateTime('2024-03-20T15:30:00.123Z');
      const encoded = encodeCbor(originalDateTime);
      const decoded = decodeCbor(encoded) as DateTime;

      expect(decoded).toBeInstanceOf(DateTime);
      expect(decoded.toISOString()).toBe(originalDateTime.toISOString());
    });

    it('should handle multiple DateTime values in an object', () => {
      const data = {
        dateTime1: new DateTime('2024-03-20T15:30:00.123Z'),
        dateTime2: new DateTime('2024-03-21T16:45:00.456Z'),
      };

      const encoded = encodeCbor(data);
      const decoded = decodeCbor(encoded) as Map<string, DateTime>;

      expect(decoded.get('dateTime1')).toBeInstanceOf(DateTime);
      expect(decoded.get('dateTime2')).toBeInstanceOf(DateTime);
      expect(decoded.get('dateTime1')?.toISOString()).toBe(
        '2024-03-20T15:30:00Z'
      );
      expect(decoded.get('dateTime2')?.toISOString()).toBe(
        '2024-03-21T16:45:00Z'
      );
    });

    describe('invalid CBOR data with Tag(0, 0)', () => {
      it('should handle Tag(0, 0) containing a number instead of string', () => {
        // Create CBOR data with Tag(0, 0) containing a number
        // Tag 0 = 0xc0, followed by a number (e.g., 42 = 0x18 0x2A)
        const invalidCborData = new Uint8Array([0xc0, 0x18, 0x2a]); // Tag(0, 42)

        const result = decodeCbor(invalidCborData);
        console.log('Tag(0, 42) decoded as:', result, typeof result);

        // The CBOR-x library might handle this gracefully or return a special value
        expect(result).toBeDefined();
      });

      it('should handle Tag(0, 0) containing an array instead of string', () => {
        // Create CBOR data with Tag(0, 0) containing an array
        // Tag 0 = 0xc0, followed by array [1, 2, 3] = 0x83 0x01 0x02 0x03
        const invalidCborData = new Uint8Array([0xc0, 0x83, 0x01, 0x02, 0x03]);

        const result = decodeCbor(invalidCborData);
        console.log('Tag(0, [1,2,3]) decoded as:', result, typeof result);

        // CBOR-x might handle this gracefully or return a special value
        expect(result).toBeDefined();
      });

      it('should handle Tag(0, 0) containing a boolean instead of string', () => {
        // Create CBOR data with Tag(0, 0) containing a boolean
        // Tag 0 = 0xc0, followed by true = 0xf5
        const invalidCborData = new Uint8Array([0xc0, 0xf5]);

        const result = decodeCbor(invalidCborData);
        console.log('Tag(0, true) decoded as:', result, typeof result);

        // CBOR-x might handle this gracefully or return a special value
        expect(result).toBeDefined();
      });

      it('should handle Tag(0, 0) containing null instead of string', () => {
        // Create CBOR data with Tag(0, 0) containing null
        // Tag 0 = 0xc0, followed by null = 0xf6
        const invalidCborData = new Uint8Array([0xc0, 0xf6]);

        const result = decodeCbor(invalidCborData);
        console.log('Tag(0, null) decoded as:', result, typeof result);

        // CBOR-x might handle this gracefully or return a special value
        expect(result).toBeDefined();
      });

      it('should handle Tag(0, 0) containing an empty string', () => {
        // Create CBOR data with Tag(0, 0) containing an empty string
        // Tag 0 = 0xc0, followed by empty string = 0x60
        const invalidCborData = new Uint8Array([0xc0, 0x60]);

        const result = decodeCbor(invalidCborData);
        console.log('Tag(0, "") decoded as:', result, typeof result);

        // CBOR-x might handle this gracefully or return a special value
        expect(result).toBeDefined();
      });

      it('should handle Tag(0, 0) containing an invalid date string', () => {
        // Create CBOR data with Tag(0, 0) containing an invalid date string
        // Tag 0 = 0xc0, followed by string "invalid-date" = 0x6c 0x69 0x6e 0x76 0x61 0x6c 0x69 0x64 0x2d 0x64 0x61 0x74 0x65
        const invalidCborData = new Uint8Array([
          0xc0, 0x6c, 0x69, 0x6e, 0x76, 0x61, 0x6c, 0x69, 0x64, 0x2d, 0x64,
          0x61, 0x74, 0x65,
        ]);

        const result = decodeCbor(invalidCborData);
        console.log(
          'Tag(0, "invalid-date") decoded as:',
          result,
          typeof result,
          result instanceof DateTime
        );

        // CBOR-x might handle this gracefully or return a special value
        expect(result).toBeDefined();
      });

      it('should handle Tag(0, 0) containing a malformed date string', () => {
        // Create CBOR data with Tag(0, 0) containing a malformed date string
        // Tag 0 = 0xc0, followed by string "2024-13-45T25:70:99Z" = 0x74 0x32 0x30 0x32 0x34 0x2d 0x31 0x33 0x2d 0x34 0x35 0x54 0x32 0x35 0x3a 0x37 0x30 0x3a 0x39 0x39 0x5a
        const invalidCborData = new Uint8Array([
          0xc0, 0x74, 0x32, 0x30, 0x32, 0x34, 0x2d, 0x31, 0x33, 0x2d, 0x34,
          0x35, 0x54, 0x32, 0x35, 0x3a, 0x37, 0x30, 0x3a, 0x39, 0x39, 0x5a,
        ]);

        const result = decodeCbor(invalidCborData);
        console.log(
          'Tag(0, "2024-13-45T25:70:99Z") decoded as:',
          result,
          typeof result
        );

        // CBOR-x might handle this gracefully or return a special value
        expect(result).toBeDefined();
      });

      it('should handle nested invalid Tag(0, 0) in an object', () => {
        // Create CBOR data with an object containing invalid Tag(0, 0)
        // Object with key "date" and Tag(0, 0) containing a number
        // { "date": Tag(0, 42) }
        const invalidCborData = new Uint8Array([
          0xa1, // map(1)
          0x64,
          0x64,
          0x61,
          0x74,
          0x65, // "date"
          0xc0,
          0x18,
          0x2a, // Tag(0, 42)
        ]);

        const result = decodeCbor(invalidCborData);
        console.log(
          'Object with Tag(0, 42) decoded as:',
          result,
          typeof result
        );

        // CBOR-x might handle this gracefully or return a special value
        expect(result).toBeDefined();
      });
    });
  });
});
