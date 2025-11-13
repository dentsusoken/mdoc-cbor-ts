import { describe, it, expect } from 'vitest';
import { toIssuerSignedObject } from '../toIssuerSignedObject';
import { createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { createTag24 } from '@/cbor/createTag24';
import { createSign1Schema } from '@/schemas/cose/Sign1';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { Tag } from 'cbor-x';

const issuerAuthSchema = createSign1Schema('IssuerAuth');

describe('toIssuerSignedObject', () => {
  it('should extract nameSpaces and issuerAuth from IssuerSigned', () => {
    const nameSpaces: IssuerNameSpaces = new Map([
      [
        'org.iso.18013.5.1',
        [
          createTag24(
            new Map<string, unknown>([
              ['digestID', 0],
              ['random', new Uint8Array(32)],
              ['elementIdentifier', 'given_name'],
              ['elementValue', 'John'],
            ])
          ) as Tag,
        ],
      ],
    ]);

    const issuerAuth = issuerAuthSchema.parse([
      new Uint8Array([0xa1, 0x01, 0x26]), // protected headers
      new Map<number, unknown>(), // unprotected headers
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]), // payload
      new Uint8Array(64), // signature
    ]);

    const issuerSigned = createIssuerSigned([
      ['nameSpaces', nameSpaces],
      ['issuerAuth', issuerAuth],
    ]);

    const result = toIssuerSignedObject(issuerSigned);

    expect(result.nameSpaces).toBe(nameSpaces);
    expect(result.issuerAuth).toBe(issuerAuth);
  });

  it('should throw ErrorCodeError when issuerAuth is missing', () => {
    const nameSpaces: IssuerNameSpaces = new Map([
      [
        'org.iso.18013.5.1',
        [
          createTag24(
            new Map<string, unknown>([
              ['digestID', 0],
              ['random', new Uint8Array(32)],
              ['elementIdentifier', 'given_name'],
              ['elementValue', 'John'],
            ])
          ) as Tag,
        ],
      ],
    ]);

    const issuerSigned = createIssuerSigned([
      ['nameSpaces', nameSpaces],
      [
        'issuerAuth',
        issuerAuthSchema.parse([
          new Uint8Array([0xa1, 0x01, 0x26]),
          new Map<number, unknown>(),
          new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
          new Uint8Array(64),
        ]),
      ],
    ]);
    issuerSigned.delete('issuerAuth');

    try {
      toIssuerSignedObject(issuerSigned);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.IssuerAuthMissing);
      expect(err.message).toBe(
        `The issuer authentication is missing. - ${MdocErrorCode.IssuerAuthMissing} - IssuerAuthMissing`
      );
    }
  });

  it('should throw ErrorCodeError when nameSpaces is missing', () => {
    const issuerAuth = issuerAuthSchema.parse([
      new Uint8Array([0xa1, 0x01, 0x26]), // protected headers
      new Map<number, unknown>(), // unprotected headers
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]), // payload
      new Uint8Array(64), // signature
    ]);

    const nameSpaces: IssuerNameSpaces = new Map([
      [
        'org.iso.18013.5.1',
        [
          createTag24(
            new Map<string, unknown>([
              ['digestID', 0],
              ['random', new Uint8Array(32)],
              ['elementIdentifier', 'given_name'],
              ['elementValue', 'John'],
            ])
          ) as Tag,
        ],
      ],
    ]);

    const issuerSigned = createIssuerSigned([
      ['nameSpaces', nameSpaces],
      ['issuerAuth', issuerAuth],
    ]);
    issuerSigned.delete('nameSpaces');

    try {
      toIssuerSignedObject(issuerSigned);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.IssuerNameSpacesMissing);
      expect(err.message).toBe(
        `The issuer name spaces are missing. - ${MdocErrorCode.IssuerNameSpacesMissing} - IssuerNameSpacesMissing`
      );
    }
  });
});
