import { Sign1 } from '@auth0/cose';
import { TypedMap } from '@jfromaniello/typedmap';
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
      new Map<any, any>([
        ['docType', 'com.example.document'],
        [
          'issuerSigned',
          new Map<any, any>([
            [
              'nameSpaces',
              new Map([
                [
                  'org.iso.18013.5.1',
                  [
                    new ByteString(
                      new TypedMap([
                        ['digestID', 1],
                        ['random', Buffer.from([])],
                        ['elementIdentifier', 'given_name'],
                        ['elementValue', 'John'],
                      ])
                    ),
                  ],
                ],
              ]),
            ],
            ['issuerAuth', sign1.getContentForEncoding()],
          ]),
        ],
        [
          'deviceSigned',
          new Map<any, any>([
            ['nameSpaces', new ByteString(new Map())],
            [
              'deviceAuth',
              new Map([['deviceSignature', sign1.getContentForEncoding()]]),
            ],
          ]),
        ],
      ]),
    ];

    validDocuments.forEach((doc) => {
      expect(() => documentSchema.parse(doc)).not.toThrow();
      const result = documentSchema.parse(doc);
      expect(result.docType).toEqual(doc.get('docType'));
      expect(result.issuerSigned.nameSpaces).toEqual(
        Object.fromEntries(doc.get('issuerSigned').get('nameSpaces'))
      );
      expect(result.deviceSigned!.nameSpaces).toEqual(
        doc.get('deviceSigned').get('nameSpaces')
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
