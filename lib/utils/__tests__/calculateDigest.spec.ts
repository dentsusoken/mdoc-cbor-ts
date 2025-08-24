import { describe, expect, it } from 'vitest';
import { calculateDigest } from '../calculateDigest';
import { createTag24 } from '@/cbor/createTag24';

describe('calculateDigest', () => {
  it('should calculate SHA-256 digest of simple data', async () => {
    const data = { name: 'John', age: 30 };
    const digest = await calculateDigest('SHA-256', data);

    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest.length).toBe(32); // SHA-256 produces 32 bytes
  });

  it('should calculate SHA-384 digest of simple data', async () => {
    const data = { name: 'John', age: 30 };
    const digest = await calculateDigest('SHA-384', data);

    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest.length).toBe(48); // SHA-384 produces 48 bytes
  });

  it('should calculate SHA-512 digest of simple data', async () => {
    const data = { name: 'John', age: 30 };
    const digest = await calculateDigest('SHA-512', data);

    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest.length).toBe(64); // SHA-512 produces 64 bytes
  });

  it('should calculate digest of CBOR Tag 24 data', async () => {
    const issuerSignedItem = {
      digestID: 1,
      random: new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]),
      elementIdentifier: 'given_name',
      elementValue: 'John',
    };
    const tag24 = createTag24(issuerSignedItem);
    const digest = await calculateDigest('SHA-256', tag24);

    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest.length).toBe(32);
  });

  it('should produce consistent digests for same data', async () => {
    const data = { name: 'John', age: 30 };
    const digest1 = await calculateDigest('SHA-256', data);
    const digest2 = await calculateDigest('SHA-256', data);

    expect(digest1).toEqual(digest2);
  });

  it('should produce different digests for different data', async () => {
    const data1 = { name: 'John', age: 30 };
    const data2 = { name: 'Jane', age: 30 };

    const digest1 = await calculateDigest('SHA-256', data1);
    const digest2 = await calculateDigest('SHA-256', data2);

    expect(digest1).not.toEqual(digest2);
  });

  it('should handle primitive data types', async () => {
    const stringData = 'test string';
    const numberData = 42;
    const booleanData = true;

    const stringDigest = await calculateDigest('SHA-256', stringData);
    const numberDigest = await calculateDigest('SHA-256', numberData);
    const booleanDigest = await calculateDigest('SHA-256', booleanData);

    expect(stringDigest).toBeInstanceOf(Uint8Array);
    expect(numberDigest).toBeInstanceOf(Uint8Array);
    expect(booleanDigest).toBeInstanceOf(Uint8Array);
    expect(stringDigest.length).toBe(32);
  });

  it('should handle nested objects', async () => {
    const nestedData = {
      user: {
        name: 'John',
        details: {
          age: 30,
          city: 'Tokyo',
        },
      },
    };

    const digest = await calculateDigest('SHA-256', nestedData);
    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest.length).toBe(32);
  });

  it('should handle arrays', async () => {
    const arrayData = [1, 2, 3, 'test', { key: 'value' }];
    const digest = await calculateDigest('SHA-256', arrayData);

    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest.length).toBe(32);
  });

  it('should handle empty objects and arrays', async () => {
    const emptyObject = {};
    const emptyArray: unknown[] = [];

    const objectDigest = await calculateDigest('SHA-256', emptyObject);
    const arrayDigest = await calculateDigest('SHA-256', emptyArray);

    expect(objectDigest).toBeInstanceOf(Uint8Array);
    expect(arrayDigest).toBeInstanceOf(Uint8Array);
    expect(objectDigest.length).toBe(32);
    expect(arrayDigest.length).toBe(32);
  });

  it('should handle null and undefined values', async () => {
    const nullData = null;
    const undefinedData = undefined;

    const nullDigest = await calculateDigest('SHA-256', nullData);
    const undefinedDigest = await calculateDigest('SHA-256', undefinedData);

    expect(nullDigest).toBeInstanceOf(Uint8Array);
    expect(undefinedDigest).toBeInstanceOf(Uint8Array);
    expect(nullDigest.length).toBe(32);
    expect(undefinedDigest.length).toBe(32);
  });

  it('should handle Uint8Array data', async () => {
    const binaryData = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const digest = await calculateDigest('SHA-256', binaryData);

    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest.length).toBe(32);
  });

  it('should handle complex mdoc-like data structures', async () => {
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

    const digest = await calculateDigest('SHA-256', mdocData);
    expect(digest).toBeInstanceOf(Uint8Array);
    expect(digest.length).toBe(32);
  });
});
