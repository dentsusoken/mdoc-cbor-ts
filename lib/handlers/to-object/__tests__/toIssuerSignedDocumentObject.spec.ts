import { describe, it, expect } from 'vitest';
import { toIssuerSignedDocumentObject } from '../toIssuerSignedDocumentObject';
import { createDocument } from '@/schemas/mdoc/Document';
import { createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { createTag24 } from '@/cbor/createTag24';
import { createSign1Schema } from '@/schemas/cose/Sign1';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { Tag } from 'cbor-x';

const issuerAuthSchema = createSign1Schema('IssuerAuth');

describe('toIssuerSignedDocumentObject', () => {
  it('should extract docType and issuerSigned from Document', () => {
    const docType = 'org.iso.18013.5.1.mDL';
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

    const document = createDocument([
      ['docType', docType],
      ['issuerSigned', issuerSigned],
    ]);

    const result = toIssuerSignedDocumentObject(document);

    expect(result.docType).toBe(docType);
    expect(result.issuerSigned).toBeInstanceOf(Map);
    expect(result.issuerSigned.get('nameSpaces')).toBe(nameSpaces);
    expect(result.issuerSigned.get('issuerAuth')).toBe(issuerAuth);
  });

  it('should throw ErrorCodeError when docType is missing', () => {
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
      new Uint8Array([0xa1, 0x01, 0x26]),
      new Map<number, unknown>(),
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
      new Uint8Array(64),
    ]);

    const issuerSigned = createIssuerSigned([
      ['nameSpaces', nameSpaces],
      ['issuerAuth', issuerAuth],
    ]);

    const document = createDocument([
      ['docType', 'org.iso.18013.5.1.mDL'],
      ['issuerSigned', issuerSigned],
    ]);
    document.delete('docType');

    try {
      toIssuerSignedDocumentObject(document);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DocTypeMissing);
      expect(err.message).toBe(
        `The document type is missing. - ${MdocErrorCode.DocTypeMissing} - DocTypeMissing`
      );
    }
  });

  it('should throw ErrorCodeError when issuerSigned is missing', () => {
    const docType = 'org.iso.18013.5.1.mDL';
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

    const document = createDocument([
      ['docType', docType],
      ['issuerSigned', issuerSigned],
    ]);
    document.delete('issuerSigned');

    try {
      toIssuerSignedDocumentObject(document);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.IssuerSignedMissing);
      expect(err.message).toBe(
        `The issuer-signed structure is missing. - ${MdocErrorCode.IssuerSignedMissing} - IssuerSignedMissing`
      );
    }
  });
});
