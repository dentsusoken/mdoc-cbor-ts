import { describe, expect, it } from 'vitest';
import { documentSchema } from '../Document';
import { createTag24 } from '@/cbor/createTag24';
import { mapInvalidTypeMessage } from '@/schemas/common/Map';
import { requiredMessage } from '@/schemas/common/Required';
import { Document, MDoc } from '@auth0/mdl';
import { createTag1004 } from '@/cbor/createTag1004';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { Tag } from 'cbor-x';
import { decodeCbor } from '@/cbor/codec';

describe('Document', () => {
  const protectedHeaders = Uint8Array.from([]);
  const unprotectedHeaders = new Map<number, unknown>();
  const payload = Uint8Array.from([]);
  const signature = Uint8Array.from([]);

  const validDocument = new Map<string, unknown>([
    ['docType', 'com.example.document'],
    [
      'issuerSigned',
      new Map<string, unknown>([
        [
          'nameSpaces',
          new Map([
            [
              'org.iso.18013.5.1',
              [
                createTag24(
                  new Map<string, unknown>([
                    ['digestID', 1],
                    ['random', Uint8Array.from([])],
                    ['elementIdentifier', 'given_name'],
                    ['elementValue', 'John'],
                  ])
                ),
              ],
            ],
          ]),
        ],
        [
          'issuerAuth',
          [protectedHeaders, unprotectedHeaders, payload, signature],
        ],
      ]),
    ],
    [
      'deviceSigned',
      new Map<string, unknown>([
        ['nameSpaces', createTag24(new Map<string, unknown>())],
        [
          'deviceAuth',
          new Map([
            [
              'deviceSignature',
              [protectedHeaders, unprotectedHeaders, payload, signature],
            ],
          ]),
        ],
      ]),
    ],
  ]);

  describe('valid cases', () => {
    it('should accept valid document with issuerSigned and deviceSigned', () => {
      const result = documentSchema.parse(validDocument);
      expect(result.docType).toEqual(validDocument.get('docType'));

      const issuerSignedInput = validDocument.get('issuerSigned') as Map<
        string,
        unknown
      >;
      const issuerNameSpacesInput = issuerSignedInput.get('nameSpaces');
      expect(result.issuerSigned!.nameSpaces).toEqual(issuerNameSpacesInput);

      const deviceSignedInput = validDocument.get('deviceSigned') as Map<
        string,
        unknown
      >;
      const deviceNameSpacesInput = deviceSignedInput.get('nameSpaces');
      expect(result.deviceSigned!.nameSpaces).toEqual(deviceNameSpacesInput);
    });

    it('should accept valid document with issuerSigned only', () => {
      const validDocument2 = new Map<string, unknown>(validDocument.entries());
      validDocument2.delete('deviceSigned');
      const result = documentSchema.parse(validDocument2);
      expect(result.docType).toEqual(validDocument2.get('docType'));

      const issuerSignedInput = validDocument.get('issuerSigned') as Map<
        string,
        unknown
      >;
      const issuerNameSpacesInput = issuerSignedInput.get('nameSpaces');
      expect(result.issuerSigned!.nameSpaces).toEqual(issuerNameSpacesInput);
      expect(validDocument2.get('deviceSigned')).toBeUndefined();
    });

    it('should accept valid document with errors and docType only', () => {
      const errorDocument = new Map<string, unknown>([
        ['docType', 'com.example.document'],
        [
          'errors',
          new Map([
            [
              'org.iso.18013.5.1',
              new Map([
                ['given_name', 0], // ErrorCode 0 for invalid_request
              ]),
            ],
          ]),
        ],
      ]);

      const result = documentSchema.parse(errorDocument);
      expect(result.docType).toEqual(errorDocument.get('docType'));
      expect(result.errors).toBeDefined();
      expect(result.errors!.size).toBe(1);
      expect(result.errors!.has('org.iso.18013.5.1')).toBe(true);
      expect(result.errors!.get('org.iso.18013.5.1')!.has('given_name')).toBe(
        true
      );
      expect(result.errors!.get('org.iso.18013.5.1')!.get('given_name')).toBe(
        0
      );
      expect(result.issuerSigned).toBeUndefined();
      expect(result.deviceSigned).toBeUndefined();
    });
  });

  describe('auth0/mdl compatibility', () => {
    it('should parse auth0/mdl created Document after encode/decode', async () => {
      const { ...publicKeyJWK } = DEVICE_JWK;
      const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

      const signed = new Date('2024-01-01T00:00:00Z');
      const validFrom = new Date('2024-01-01T01:00:00Z');
      const validUntil = new Date('2025-01-01T00:00:00Z');
      const expectedUpdate = new Date('2024-06-01T00:00:00Z');

      // Create auth0/mdl document
      const document = await new Document('org.iso.18013.5.1.mDL')
        .addIssuerNameSpace('org.iso.18013.5.1', {
          family_name: 'Doe',
          given_name: 'John',
          birth_date: createTag1004(new Date('1990-01-01')),
        })
        .useDigestAlgorithm('SHA-256')
        .addValidityInfo({
          signed,
          validFrom,
          validUntil,
          expectedUpdate,
        })
        .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
        .sign({
          issuerPrivateKey,
          issuerCertificate: ISSUER_CERTIFICATE,
          alg: 'ES256',
        });

      const mdoc = new MDoc([document]);
      const encoded = mdoc.encode();

      // Decode the CBOR to get raw structure
      const decoded = decodeCbor(encoded) as Map<string, unknown>;
      const documentsArray = decoded.get('documents') as Map<string, unknown>[];

      // Parse with documentSchema
      const validated = documentSchema.parse(documentsArray[0]);

      // Verify Document structure
      expect(validated.docType).toBe('org.iso.18013.5.1.mDL');
      expect(validated.issuerSigned).toBeDefined();

      if (!validated.issuerSigned) {
        throw new Error('issuerSigned is undefined');
      }

      // Verify issuerSigned structure
      expect(validated.issuerSigned.nameSpaces).toBeInstanceOf(Map);
      expect(validated.issuerSigned.issuerAuth).toBeInstanceOf(Tag);
      expect(validated.issuerSigned.issuerAuth.tag).toBe(18);

      // Verify nameSpaces
      expect(validated.issuerSigned.nameSpaces.size).toBe(1);
      expect(validated.issuerSigned.nameSpaces.has('org.iso.18013.5.1')).toBe(
        true
      );

      const nameSpace =
        validated.issuerSigned.nameSpaces.get('org.iso.18013.5.1');
      expect(nameSpace).toBeInstanceOf(Array);
      expect(nameSpace?.length).toBe(3); // family_name, given_name, birth_date

      // Each item should be a Tag24
      nameSpace?.forEach((item) => {
        expect(item).toBeInstanceOf(Tag);
        expect(item.tag).toBe(24);
      });

      // Verify issuerAuth (COSE_Sign1)
      expect(validated.issuerSigned.issuerAuth.value).toBeInstanceOf(Array);
      expect(validated.issuerSigned.issuerAuth.value).toHaveLength(4);
      expect(validated.issuerSigned.issuerAuth.value[0]).toBeInstanceOf(
        Uint8Array
      ); // protected headers
      expect(validated.issuerSigned.issuerAuth.value[1]).toBeInstanceOf(Map); // unprotected headers
      expect(validated.issuerSigned.issuerAuth.value[2]).toBeInstanceOf(
        Uint8Array
      ); // payload
      expect(validated.issuerSigned.issuerAuth.value[3]).toBeInstanceOf(
        Uint8Array
      ); // signature
    });

    it('should parse auth0/mdl created Document without expectedUpdate', async () => {
      const { ...publicKeyJWK } = DEVICE_JWK;
      const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

      const signed = new Date('2024-01-01T00:00:00Z');
      const validFrom = new Date('2024-01-01T01:00:00Z');
      const validUntil = new Date('2025-01-01T00:00:00Z');

      // Create auth0/mdl document without expectedUpdate
      const document = await new Document('org.iso.18013.5.1.mDL')
        .addIssuerNameSpace('org.iso.18013.5.1', {
          family_name: 'Smith',
          given_name: 'Alice',
        })
        .useDigestAlgorithm('SHA-256')
        .addValidityInfo({
          signed,
          validFrom,
          validUntil,
          // No expectedUpdate
        })
        .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
        .sign({
          issuerPrivateKey,
          issuerCertificate: ISSUER_CERTIFICATE,
          alg: 'ES256',
        });

      const mdoc = new MDoc([document]);
      const encoded = mdoc.encode();

      // Decode the CBOR to get raw structure
      const decoded = decodeCbor(encoded) as Map<string, unknown>;
      const documentsArray = decoded.get('documents') as Map<string, unknown>[];

      // Parse with documentSchema
      const validated = documentSchema.parse(documentsArray[0]);

      // Verify Document structure
      expect(validated.docType).toBe('org.iso.18013.5.1.mDL');
      expect(validated.issuerSigned).toBeDefined();

      if (!validated.issuerSigned) {
        throw new Error('issuerSigned is undefined');
      }

      // Verify issuerSigned structure
      expect(validated.issuerSigned.nameSpaces).toBeInstanceOf(Map);
      expect(validated.issuerSigned.issuerAuth).toBeInstanceOf(Tag);
      expect(validated.issuerSigned.nameSpaces.size).toBe(1);

      const nameSpace =
        validated.issuerSigned.nameSpaces.get('org.iso.18013.5.1');
      expect(nameSpace?.length).toBe(2); // family_name, given_name
    });

    it('should parse auth0/mdl created Document with multiple namespaces', async () => {
      const { ...publicKeyJWK } = DEVICE_JWK;
      const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

      const signed = new Date('2024-01-01T00:00:00Z');
      const validFrom = new Date('2024-01-01T01:00:00Z');
      const validUntil = new Date('2025-01-01T00:00:00Z');

      // Create auth0/mdl document with multiple namespaces
      const document = await new Document('org.iso.18013.5.1.mDL')
        .addIssuerNameSpace('org.iso.18013.5.1', {
          family_name: 'Brown',
          given_name: 'Bob',
          birth_date: createTag1004(new Date('1985-05-15')),
        })
        .addIssuerNameSpace('org.iso.18013.5.2', {
          license_number: 'D1234567',
        })
        .useDigestAlgorithm('SHA-256')
        .addValidityInfo({
          signed,
          validFrom,
          validUntil,
        })
        .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
        .sign({
          issuerPrivateKey,
          issuerCertificate: ISSUER_CERTIFICATE,
          alg: 'ES256',
        });

      const mdoc = new MDoc([document]);
      const encoded = mdoc.encode();

      // Decode the CBOR to get raw structure
      const decoded = decodeCbor(encoded) as Map<string, unknown>;
      const documentsArray = decoded.get('documents') as Map<string, unknown>[];

      // Parse with documentSchema
      const validated = documentSchema.parse(documentsArray[0]);

      // Verify Document structure
      expect(validated.docType).toBe('org.iso.18013.5.1.mDL');
      expect(validated.issuerSigned).toBeDefined();

      if (!validated.issuerSigned) {
        throw new Error('issuerSigned is undefined');
      }

      // Verify both namespaces are present
      expect(validated.issuerSigned.nameSpaces.size).toBe(2);
      expect(validated.issuerSigned.nameSpaces.has('org.iso.18013.5.1')).toBe(
        true
      );
      expect(validated.issuerSigned.nameSpaces.has('org.iso.18013.5.2')).toBe(
        true
      );

      const ns1 = validated.issuerSigned.nameSpaces.get('org.iso.18013.5.1');
      const ns2 = validated.issuerSigned.nameSpaces.get('org.iso.18013.5.2');

      expect(ns1?.length).toBe(3); // family_name, given_name, birth_date
      expect(ns2?.length).toBe(1); // license_number
    });
  });

  describe('invalid cases', () => {
    const invalidTypeCases: Array<{
      name: string;
      input: unknown;
      expected: string;
    }> = [
      {
        name: 'null input',
        input: null,
        expected: requiredMessage('Document'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMessage('Document'),
      },
      {
        name: 'boolean input',
        input: true,
        expected: mapInvalidTypeMessage('Document'),
      },
      {
        name: 'number input',
        input: 123,
        expected: mapInvalidTypeMessage('Document'),
      },
      {
        name: 'string input',
        input: 'string',
        expected: mapInvalidTypeMessage('Document'),
      },
      {
        name: 'array input',
        input: [],
        expected: mapInvalidTypeMessage('Document'),
      },
      {
        name: 'plain object input',
        input: {},
        expected: mapInvalidTypeMessage('Document'),
      },
    ];

    invalidTypeCases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          documentSchema.parse(input as never);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          const zodError = error as import('zod').ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
