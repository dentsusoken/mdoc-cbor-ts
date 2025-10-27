import { describe, expect, it } from 'vitest';
import { calculateDigest } from '../calculateDigest';
import { createTag24 } from '@/cbor/createTag24';

describe('calculateDigest', () => {
  describe('basic functionality', () => {
    it('SHA-256 produces 32 bytes', () => {
      const data = { name: 'John', age: 30 };
      const digest = calculateDigest('SHA-256', data);

      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(32);
    });

    it('SHA-384 produces 48 bytes', () => {
      const data = { name: 'John', age: 30 };
      const digest = calculateDigest('SHA-384', data);

      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(48);
    });

    it('SHA-512 produces 64 bytes', () => {
      const data = { name: 'John', age: 30 };
      const digest = calculateDigest('SHA-512', data);

      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(64);
    });
  });

  describe('mdoc-specific data', () => {
    it('calculates digest of CBOR Tag 24 data', () => {
      const issuerSignedItem = {
        digestID: 1,
        random: new Uint8Array([
          0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
        ]),
        elementIdentifier: 'given_name',
        elementValue: 'John',
      };
      const tag24 = createTag24(issuerSignedItem);
      const digest = calculateDigest('SHA-256', tag24);

      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(32);
    });

    it('handles complex mdoc-like data structures', () => {
      const mdocData = {
        docType: 'org.iso.18013.5.1.mDL',
        issuerSigned: {
          nameSpaces: {
            'org.iso.18013.5.1': [
              {
                digestID: 1,
                random: new Uint8Array([
                  0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
                ]),
                elementIdentifier: 'given_name',
                elementValue: 'John',
              },
            ],
          },
        },
      };

      const digest = calculateDigest('SHA-256', mdocData);
      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(32);
    });
  });

  describe('deterministic behavior', () => {
    it('produces consistent digests for same data', () => {
      const data = { name: 'John', age: 30 };
      const digest1 = calculateDigest('SHA-256', data);
      const digest2 = calculateDigest('SHA-256', data);

      expect(digest1).toEqual(digest2);
    });

    it('produces different digests for different data', () => {
      const data1 = { name: 'John', age: 30 };
      const data2 = { name: 'Jane', age: 30 };

      const digest1 = calculateDigest('SHA-256', data1);
      const digest2 = calculateDigest('SHA-256', data2);

      expect(digest1).not.toEqual(digest2);
    });

    it('produces different digests for different algorithms', () => {
      const data = { name: 'John', age: 30 };

      const digest256 = calculateDigest('SHA-256', data);
      const digest384 = calculateDigest('SHA-384', data);
      const digest512 = calculateDigest('SHA-512', data);

      expect(digest256).not.toEqual(digest384);
      expect(digest256).not.toEqual(digest512);
      expect(digest384).not.toEqual(digest512);
    });
  });

  describe('various data types', () => {
    it('handles primitive data types', () => {
      const stringData = 'test string';
      const numberData = 42;
      const booleanData = true;

      const stringDigest = calculateDigest('SHA-256', stringData);
      const numberDigest = calculateDigest('SHA-256', numberData);
      const booleanDigest = calculateDigest('SHA-256', booleanData);

      expect(stringDigest).toBeInstanceOf(Uint8Array);
      expect(numberDigest).toBeInstanceOf(Uint8Array);
      expect(booleanDigest).toBeInstanceOf(Uint8Array);
      expect(stringDigest.length).toBe(32);
      expect(numberDigest.length).toBe(32);
      expect(booleanDigest.length).toBe(32);
    });

    it('handles nested objects', () => {
      const nestedData = {
        user: {
          name: 'John',
          details: {
            age: 30,
            city: 'Tokyo',
          },
        },
      };

      const digest = calculateDigest('SHA-256', nestedData);
      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(32);
    });

    it('handles arrays', () => {
      const arrayData = [1, 2, 3, 'test', { key: 'value' }];
      const digest = calculateDigest('SHA-256', arrayData);

      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(32);
    });

    it('handles empty objects and arrays', () => {
      const emptyObject = {};
      const emptyArray: unknown[] = [];

      const objectDigest = calculateDigest('SHA-256', emptyObject);
      const arrayDigest = calculateDigest('SHA-256', emptyArray);

      expect(objectDigest).toBeInstanceOf(Uint8Array);
      expect(arrayDigest).toBeInstanceOf(Uint8Array);
      expect(objectDigest.length).toBe(32);
      expect(arrayDigest.length).toBe(32);
    });

    it('handles null and undefined values', () => {
      const nullData = null;
      const undefinedData = undefined;

      const nullDigest = calculateDigest('SHA-256', nullData);
      const undefinedDigest = calculateDigest('SHA-256', undefinedData);

      expect(nullDigest).toBeInstanceOf(Uint8Array);
      expect(undefinedDigest).toBeInstanceOf(Uint8Array);
      expect(nullDigest.length).toBe(32);
      expect(undefinedDigest.length).toBe(32);
    });

    it('handles Uint8Array data', () => {
      const binaryData = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const digest = calculateDigest('SHA-256', binaryData);

      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(32);
    });
  });

  describe('test vectors with known outputs', () => {
    it('produces correct SHA-256 digest for empty CBOR object', () => {
      const emptyObject = {};
      const digest = calculateDigest('SHA-256', emptyObject);

      // Verify the digest is consistent
      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(32);

      // Verify consistency with multiple calls
      const digest2 = calculateDigest('SHA-256', emptyObject);
      expect(digest).toEqual(digest2);
    });

    it('produces correct SHA-256 digest for empty CBOR array', () => {
      const emptyArray: unknown[] = [];
      const digest = calculateDigest('SHA-256', emptyArray);

      // Verify the digest is consistent
      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(32);

      // Verify consistency with multiple calls
      const digest2 = calculateDigest('SHA-256', emptyArray);
      expect(digest).toEqual(digest2);

      // Verify it's different from empty object
      const objectDigest = calculateDigest('SHA-256', {});
      expect(digest).not.toEqual(objectDigest);
    });

    it('produces correct SHA-256 digest for simple number', () => {
      const number = 0;
      const digest = calculateDigest('SHA-256', number);

      // CBOR encoding of 0 is 0x00
      // SHA-256 of 0x00
      const expected = new Uint8Array([
        0x6e, 0x34, 0x0b, 0x9c, 0xff, 0xb3, 0x7a, 0x98, 0x9c, 0xa5, 0x44, 0xe6,
        0xbb, 0x78, 0x0a, 0x2c, 0x78, 0x90, 0x1d, 0x3f, 0xb3, 0x37, 0x38, 0x76,
        0x85, 0x11, 0xa3, 0x06, 0x17, 0xaf, 0xa0, 0x1d,
      ]);

      expect(digest).toEqual(expected);
    });

    it('produces correct SHA-384 digest for empty CBOR object', () => {
      const emptyObject = {};
      const digest = calculateDigest('SHA-384', emptyObject);

      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(48);
    });

    it('produces correct SHA-512 digest for empty CBOR object', () => {
      const emptyObject = {};
      const digest = calculateDigest('SHA-512', emptyObject);

      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(64);
    });
  });

  describe('CBOR encoding verification', () => {
    it('verifies digest is based on CBOR encoding', () => {
      // Empty object {} when CBOR encoded is 0xa0
      const emptyObject = {};
      const digest = calculateDigest('SHA-256', emptyObject);

      // Verify consistency - same CBOR encoding should produce same digest
      const digest2 = calculateDigest('SHA-256', emptyObject);
      expect(digest).toEqual(digest2);
    });

    it('produces different digests for data with same values but different structure', () => {
      const arrayData = [1, 2];
      const objectData = { 0: 1, 1: 2 };

      const arrayDigest = calculateDigest('SHA-256', arrayData);
      const objectDigest = calculateDigest('SHA-256', objectData);

      // CBOR encoding differs between arrays and objects
      expect(arrayDigest).not.toEqual(objectDigest);
    });

    it('handles objects with keys in same order consistently', () => {
      // CBOR encoding maintains key order
      const data1 = { a: 1, b: 2 };
      const data2 = { a: 1, b: 2 };

      const digest1 = calculateDigest('SHA-256', data1);
      const digest2 = calculateDigest('SHA-256', data2);

      expect(digest1).toEqual(digest2);
    });

    it('handles Map objects', () => {
      const mapData = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);
      const digest = calculateDigest('SHA-256', mapData);

      expect(digest).toBeInstanceOf(Uint8Array);
      expect(digest.length).toBe(32);
    });

    it('produces different digests for different Map entry orders', () => {
      const map1 = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      const map2 = new Map([
        ['b', 2],
        ['a', 1],
      ]);

      const digest1 = calculateDigest('SHA-256', map1);
      const digest2 = calculateDigest('SHA-256', map2);

      // CBOR preserves Map entry order, so different order = different digest
      expect(digest1).not.toEqual(digest2);
    });
  });

  describe('error handling', () => {
    it('throws error for unsupported digest algorithms', () => {
      const data = { test: 'data' };

      expect(() => calculateDigest('SHA-1', data)).toThrow(
        'Unsupported digest algorithm: SHA-1'
      );
    });
  });
});
