import { describe, expect, it } from 'vitest';
import { decodeCbor, encodeCbor } from '../codec';
import { Tag1004 } from '../Tag1004';

describe('Tag1004', () => {
  describe('constructor', () => {
    it('should create a Tag1004 instance from ISO date string', () => {
      const date = new Tag1004('2024-03-20T10:00:00.000Z');
      expect(date).toBeInstanceOf(Tag1004);
      expect(date.value).toBe('2024-03-20');
    });

    it('should create a Tag1004 instance from date-only string', () => {
      const date = new Tag1004('2024-03-20');
      expect(date).toBeInstanceOf(Tag1004);
      expect(date.value).toBe('2024-03-20');
    });

    it('should strip time component from full ISO string', () => {
      const date = new Tag1004('2024-03-20T15:30:45.123Z');
      expect(date.value).toBe('2024-03-20');
    });

    it('should handle different date formats', () => {
      const date1 = new Tag1004('2024-03-20T00:00:00.000Z');
      const date2 = new Tag1004('2024-03-20T23:59:59.999Z');
      expect(date1.value).toBe('2024-03-20');
      expect(date2.value).toBe('2024-03-20');
    });
  });

  describe('CBOR encoding/decoding', () => {
    it('should encode and decode Tag1004 correctly', () => {
      const originalDate = new Tag1004('2024-03-20');
      const encoded = encodeCbor(originalDate);
      const decoded = decodeCbor(encoded) as Tag1004;

      expect(decoded).toBeInstanceOf(Tag1004);
      expect(decoded.value).toBe(originalDate.value);
    });

    it('should handle multiple Tag1004 values in an object', () => {
      const data = {
        date1: new Tag1004('2024-03-20'),
        date2: new Tag1004('2024-03-21'),
      };

      const encoded = encodeCbor(data);
      const decoded = decodeCbor(encoded) as Map<string, Tag1004>;

      expect(decoded.get('date1')).toBeInstanceOf(Tag1004);
      expect(decoded.get('date2')).toBeInstanceOf(Tag1004);
      expect(decoded.get('date1')?.value).toBe('2024-03-20');
      expect(decoded.get('date2')?.value).toBe('2024-03-21');
    });

    it('should handle Tag1004 in arrays', () => {
      const dates = [
        new Tag1004('2024-03-20'),
        new Tag1004('2024-03-21'),
        new Tag1004('2024-03-22'),
      ];

      const encoded = encodeCbor(dates);
      const decoded = decodeCbor(encoded) as Tag1004[];

      expect(decoded).toHaveLength(3);
      expect(decoded[0]).toBeInstanceOf(Tag1004);
      expect(decoded[0].value).toBe('2024-03-20');
      expect(decoded[1].value).toBe('2024-03-21');
      expect(decoded[2].value).toBe('2024-03-22');
    });

    describe('invalid CBOR data with Tag(1004)', () => {
      it('should handle CBOR tag 1004 with number 42 (milliseconds since epoch)', () => {
        // 0xd9 0x03 0xec = tag(1004); 0x18 0x2a = 42
        const data = new Uint8Array([0xd9, 0x03, 0xec, 0x18, 0x2a]);
        const result = decodeCbor(data) as Tag1004;
        expect(result).toBeInstanceOf(Tag1004);
        expect(result.value).toBe('1970-01-01');
      });

      it('should handle CBOR tag 1004 with boolean true', () => {
        // 0xd9 0x03 0xec = tag(1004); 0xf5 = true
        const data = new Uint8Array([0xd9, 0x03, 0xec, 0xf5]);
        const result = decodeCbor(data) as Tag1004;
        expect(result).toBeInstanceOf(Tag1004);
        expect(result.value).toBe('1970-01-01');
      });

      it('should handle CBOR tag 1004 with null', () => {
        // 0xd9 0x03 0xec = tag(1004); 0xf6 = null
        const data = new Uint8Array([0xd9, 0x03, 0xec, 0xf6]);
        const result = decodeCbor(data) as Tag1004;
        expect(result).toBeInstanceOf(Tag1004);
        expect(result.value).toBe('1970-01-01');
      });

      it('should handle CBOR tag 1004 with empty string', () => {
        // 0xd9 0x03 0xec = tag(1004); 0x60 = ""
        const data = new Uint8Array([0xd9, 0x03, 0xec, 0x60]);
        //const result = decodeCbor(data) as Tag1004;
        //expect(result).toBeInstanceOf(Tag1004);
        expect(() => decodeCbor(data)).toThrow('Invalid time value');
      });

      it('should handle CBOR tag 1004 with invalid string "invalid-date"', () => {
        // 0xd9 0x03 0xec = tag(1004); text(12) "invalid-date"
        const data = new Uint8Array([
          0xd9, 0x03, 0xec, 0x6c, 0x69, 0x6e, 0x76, 0x61, 0x6c, 0x69, 0x64,
          0x2d, 0x64, 0x61, 0x74, 0x65,
        ]);
        // const result = decodeCbor(data) as Tag1004;
        // expect(result).toBeInstanceOf(Tag1004);
        expect(() => decodeCbor(data)).toThrow('Invalid time value');
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
        const result = decodeCbor(data) as Map<string, Tag1004>;
        const value = result.get('date') as Tag1004;
        expect(value).toBeInstanceOf(Tag1004);
        expect(value.value).toBe('1970-01-01');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates', () => {
      const leapYearDate = new Tag1004('2024-02-29T12:00:00.000Z');
      expect(leapYearDate.value).toBe('2024-02-29');
    });

    it('should handle year boundary dates', () => {
      const newYear = new Tag1004('2024-01-01T00:00:00.000Z');
      const yearEnd = new Tag1004('2023-12-31T23:59:59.999Z');
      expect(newYear.value).toBe('2024-01-01');
      expect(yearEnd.value).toBe('2023-12-31');
    });

    it('should handle timezone variations', () => {
      const utcDate = new Tag1004('2024-03-20T10:00:00.000Z');
      const localDate = new Tag1004('2024-03-20T10:00:00.000+09:00');
      expect(utcDate.value).toBe('2024-03-20');
      expect(localDate.value).toBe('2024-03-20');
    });
  });
});
