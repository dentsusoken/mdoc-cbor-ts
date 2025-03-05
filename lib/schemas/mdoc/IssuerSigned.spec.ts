import { Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { ByteString } from '../../cbor';
import { issuerSignedSchema } from './IssuerSigned';

describe('IssuerSigned', () => {
  it('should accept valid issuer signed data', () => {
    const sign1 = new Sign1(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const validData = [
      {
        nameSpaces: {
          'org.iso.18013.5.1': [
            new ByteString({
              digestID: 1,
              random: Buffer.from([]),
              elementIdentifier: 'given_name',
              elementValue: 'John',
            }),
          ],
        },
        issuerAuth: sign1.getContentForEncoding(),
      },
    ];

    validData.forEach((data) => {
      expect(() => issuerSignedSchema.parse(data)).not.toThrow();
      const result = issuerSignedSchema.parse(data);
      expect(result.nameSpaces).toEqual(data.nameSpaces);
      expect(result.issuerAuth).toBeInstanceOf(Sign1);
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      {},
      {
        nameSpaces: null,
        issuerAuth: {
          signature: new Uint8Array([1, 2, 3]),
          certificateChain: [new Uint8Array([4, 5, 6])],
        },
      },
      {
        nameSpaces: {},
        issuerAuth: null,
      },
      {
        nameSpaces: {},
        issuerAuth: {
          signature: null,
          certificateChain: [new Uint8Array([4, 5, 6])],
        },
      },
      {
        nameSpaces: {},
        issuerAuth: {
          signature: new Uint8Array([1, 2, 3]),
          certificateChain: null,
        },
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => issuerSignedSchema.parse(input)).toThrow();
    });
  });
});
