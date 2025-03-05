import { Sign1 } from '@auth0/cose';
import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { ByteString } from '../../cbor';
import { documentSchema } from './Document';

describe('Document', () => {
  it('should accept valid document', () => {
    const sign1 = new Sign1(
      Buffer.from([]),
      new Map<number, string>([[1, 'value']]),
      Buffer.from([]),
      Buffer.from([])
    );
    const validDocuments = [
      {
        docType: 'com.example.document',
        issuerSigned: {
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
        deviceSigned: {
          nameSpaces: new ByteString({}),
          deviceAuth: {
            deviceSignature: sign1.getContentForEncoding(),
          },
        },
      },
    ];

    validDocuments.forEach((doc) => {
      expect(() => documentSchema.parse(doc)).not.toThrow();
      const result = documentSchema.parse(doc);
      expect(result.docType).toEqual(doc.docType);
      expect(result.issuerSigned.nameSpaces).toEqual(
        doc.issuerSigned.nameSpaces
      );
      expect(result.issuerSigned.issuerAuth).toBeInstanceOf(Sign1);
      expect(result.deviceSigned.nameSpaces).toEqual(
        doc.deviceSigned.nameSpaces
      );
      // @ts-ignore
      expect(result.deviceSigned.deviceAuth.deviceSignature).toBeInstanceOf(
        Sign1
      );
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
        docType: 'invalid-doc-type',
        issuerSigned: {
          nameSpaces: {},
          issuerAuth: {
            signature: new Uint8Array([1, 2, 3]),
            certificateChain: [new Uint8Array([4, 5, 6])],
          },
        },
        deviceSigned: {
          nameSpaces: new Tag(24, 0),
          deviceAuth: {
            deviceSignature: new Tag(18, 0),
          },
        },
      },
      {
        docType: 'org.iso.18013.5.1.mDL',
        issuerSigned: null,
        deviceSigned: {
          nameSpaces: new Tag(24, 0),
          deviceAuth: {
            deviceSignature: new Tag(18, 0),
          },
        },
      },
      {
        docType: 'org.iso.18013.5.1.mDL',
        issuerSigned: {
          nameSpaces: {},
          issuerAuth: {
            signature: new Uint8Array([1, 2, 3]),
            certificateChain: [new Uint8Array([4, 5, 6])],
          },
        },
        deviceSigned: null,
      },
      {
        docType: 'org.iso.18013.5.1.mDL',
        issuerSigned: {
          nameSpaces: {},
          issuerAuth: {
            signature: new Uint8Array([1, 2, 3]),
            certificateChain: [new Uint8Array([4, 5, 6])],
          },
        },
        deviceSigned: {
          nameSpaces: new Tag(24, 0),
          deviceAuth: {
            deviceSignature: new Tag(18, 0),
          },
        },
        errors: null,
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => documentSchema.parse(input)).toThrow();
    });
  });
});
