import { describe, expect, it } from 'vitest';
import { decodeCbor, encodeCbor } from '../codec';
import { Tag0 } from '../Tag0';

describe('Tag0', () => {
  describe('constructor', () => {
    it('should create a Tag0 instance from ISO date string', () => {
      const tag = new Tag0('2024-03-20T10:00:00.000Z');
      expect(tag).toBeInstanceOf(Tag0);
      expect(tag.value).toBe('2024-03-20T10:00:00Z');
    });

    it('should create a Tag0 instance from date string without milliseconds', () => {
      const tag = new Tag0('2024-03-20T10:00:00Z');
      expect(tag).toBeInstanceOf(Tag0);
      expect(tag.value).toBe('2024-03-20T10:00:00Z');
    });

    it('should strip milliseconds from full ISO string', () => {
      const tag = new Tag0('2024-03-20T15:30:45.123Z');
      expect(tag.value).toBe('2024-03-20T15:30:45Z');
    });

    it('should handle different date formats', () => {
      const tag1 = new Tag0('2024-03-20T00:00:00.000Z');
      const tag2 = new Tag0('2024-03-20T23:59:59.999Z');
      expect(tag1.value).toBe('2024-03-20T00:00:00Z');
      expect(tag2.value).toBe('2024-03-20T23:59:59Z');
    });

    it('should handle full-date strings (YYYY-MM-DD)', () => {
      const tag = new Tag0('2024-03-20');
      expect(tag.value).toBe('2024-03-20T00:00:00Z');
    });

    it('should handle full-date strings with different dates', () => {
      const tag1 = new Tag0('2024-01-01');
      const tag2 = new Tag0('2024-12-31');
      const tag3 = new Tag0('2024-02-29'); // Leap year
      expect(tag1.value).toBe('2024-01-01T00:00:00Z');
      expect(tag2.value).toBe('2024-12-31T00:00:00Z');
      expect(tag3.value).toBe('2024-02-29T00:00:00Z');
    });
  });

  describe('CBOR encoding/decoding', () => {
    it('should encode and decode Tag0 correctly', () => {
      const originalTag = new Tag0('2024-03-20T10:00:00.000Z');
      const encoded = encodeCbor(originalTag);
      const decoded = decodeCbor(encoded) as Tag0;

      expect(decoded).toBeInstanceOf(Tag0);
      expect(decoded.value).toBe(originalTag.value);
    });

    it('should handle multiple Tag0 values in an object', () => {
      const data = {
        tag1: new Tag0('2024-03-20T10:00:00.000Z'),
        tag2: new Tag0('2024-03-21T15:30:00.000Z'),
      };

      const encoded = encodeCbor(data);
      const decoded = decodeCbor(encoded) as Map<string, Tag0>;

      expect(decoded.get('tag1')).toBeInstanceOf(Tag0);
      expect(decoded.get('tag2')).toBeInstanceOf(Tag0);
      expect(decoded.get('tag1')?.value).toBe('2024-03-20T10:00:00Z');
      expect(decoded.get('tag2')?.value).toBe('2024-03-21T15:30:00Z');
    });

    it('should handle Tag0 in arrays', () => {
      const tags = [
        new Tag0('2024-03-20T10:00:00.000Z'),
        new Tag0('2024-03-21T15:30:00.000Z'),
        new Tag0('2024-03-22T20:45:00.000Z'),
      ];

      const encoded = encodeCbor(tags);
      const decoded = decodeCbor(encoded) as Tag0[];

      expect(decoded).toHaveLength(3);
      expect(decoded[0]).toBeInstanceOf(Tag0);
      expect(decoded[0].value).toBe('2024-03-20T10:00:00Z');
      expect(decoded[1].value).toBe('2024-03-21T15:30:00Z');
      expect(decoded[2].value).toBe('2024-03-22T20:45:00Z');
    });

    describe('invalid CBOR data with Tag(0)', () => {
      it('should handle CBOR tag 0 with number 42 (milliseconds since epoch)', () => {
        // 0xc0 = tag(0); 0x18 0x2a = 42
        const data = new Uint8Array([0xc0, 0x18, 0x2a]);
        const result = decodeCbor(data) as Tag0;
        expect(result).toBeInstanceOf(Tag0);
        expect(result.value).toBe('1970-01-01T00:00:00Z');
      });

      it('should handle CBOR tag 0 with boolean true', () => {
        // 0xc0 = tag(0); 0xf5 = true
        const data = new Uint8Array([0xc0, 0xf5]);
        const result = decodeCbor(data) as Tag0;
        expect(result).toBeInstanceOf(Tag0);
        expect(result.value).toBe('1970-01-01T00:00:00Z');
      });

      it('should handle CBOR tag 0 with null', () => {
        // 0xc0 = tag(0); 0xf6 = null
        const data = new Uint8Array([0xc0, 0xf6]);
        const result = decodeCbor(data) as Tag0;
        expect(result).toBeInstanceOf(Tag0);
        expect(result.value).toBe('1970-01-01T00:00:00Z');
      });

      it('should handle CBOR tag 0 with empty string', () => {
        // 0xc0 = tag(0); 0x60 = ""
        const data = new Uint8Array([0xc0, 0x60]);
        expect(() => decodeCbor(data)).toThrow('Invalid time value');
      });

      it('should handle CBOR tag 0 with invalid string "invalid-date"', () => {
        // 0xc0 = tag(0); text(12) "invalid-date"
        const data = new Uint8Array([
          0xc0, 0x6c, 0x69, 0x6e, 0x76, 0x61, 0x6c, 0x69, 0x64, 0x2d, 0x64,
          0x61, 0x74, 0x65,
        ]);
        expect(() => decodeCbor(data)).toThrow('Invalid time value');
      });

      it('should handle nested CBOR tag 0 with number 42 in an object', () => {
        // { "date": tag(0) 42 }
        const data = new Uint8Array([
          0xa1, // map(1)
          0x64,
          0x64,
          0x61,
          0x74,
          0x65, // "date"
          0xc0, // tag(0)
          0x18,
          0x2a, // 42
        ]);
        const result = decodeCbor(data) as Map<string, Tag0>;
        const value = result.get('date') as Tag0;
        expect(value).toBeInstanceOf(Tag0);
        expect(value.value).toBe('1970-01-01T00:00:00Z');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates', () => {
      const leapYearDate = new Tag0('2024-02-29T12:00:00.000Z');
      expect(leapYearDate.value).toBe('2024-02-29T12:00:00Z');
    });

    it('should handle year boundary dates', () => {
      const newYear = new Tag0('2024-01-01T00:00:00.000Z');
      const yearEnd = new Tag0('2023-12-31T23:59:59.999Z');
      expect(newYear.value).toBe('2024-01-01T00:00:00Z');
      expect(yearEnd.value).toBe('2023-12-31T23:59:59Z');
    });

    it('should handle timezone variations', () => {
      const utcDate = new Tag0('2024-03-20T10:00:00.000Z');
      const localDate = new Tag0('2024-03-20T10:00:00.000+09:00');
      expect(utcDate.value).toBe('2024-03-20T10:00:00Z');
      expect(localDate.value).toBe('2024-03-20T01:00:00Z'); // Converted to UTC
    });

    it('should handle dates with different millisecond precision', () => {
      const date1 = new Tag0('2024-03-20T10:00:00.1Z');
      const date2 = new Tag0('2024-03-20T10:00:00.12Z');
      const date3 = new Tag0('2024-03-20T10:00:00.123Z');
      expect(date1.value).toBe('2024-03-20T10:00:00Z');
      expect(date2.value).toBe('2024-03-20T10:00:00Z');
      expect(date3.value).toBe('2024-03-20T10:00:00Z');
    });
  });
});
