import { describe, expect, it } from 'vitest';
import {
  createMDocSchema,
  createMDocObjectSchema,
  mdocAtLeastOneDocumentOrErrorMessage,
  mdocSchema,
  type MDoc,
} from '../MDoc';
import { documentSchema } from '../Document';
import { createTag24 } from '@/cbor/createTag24';
import { mapInvalidTypeMessage } from '@/schemas/common/container/Map';
import { requiredMessage } from '@/schemas/common/Required';
import { Document, MDoc as Auth0MDoc } from '@auth0/mdl';
import { createTag1004 } from '@/cbor/createTag1004';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';
import { decodeCbor } from '@/cbor/codec';
import { VERSION_INVALID_VALUE_MESSAGE } from '@/schemas/common/Version';
import { ZodError } from 'zod';

describe('MDoc', () => {
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
  ]);

  const validDocumentError = new Map<string, unknown>([
    ['com.example.document', 0],
  ]);

  describe('mdocAtLeastOneDocumentOrErrorMessage', () => {
    it('should generate correct error message with target name', () => {
      const target = 'MDoc';
      const message = mdocAtLeastOneDocumentOrErrorMessage(target);
      expect(message).toBe(
        'MDoc: At least one document or documentError must be provided.'
      );
    });

    it('should generate error message with custom target name', () => {
      const target = 'CustomMDoc';
      const message = mdocAtLeastOneDocumentOrErrorMessage(target);
      expect(message).toBe(
        'CustomMDoc: At least one document or documentError must be provided.'
      );
    });
  });

  describe('createMDocObjectSchema', () => {
    it('should create a schema with correct validation', () => {
      const schema = createMDocObjectSchema('TestMDoc');
      const validData = {
        version: '1.0' as const,
        documents: [validDocument], // Map will be converted to object by documentSchema
        status: 0,
      };

      const result = schema.parse(validData);

      // After parsing, documents[0] should be a plain object, not a Map
      expect(result.version).toBe('1.0');
      expect(result.status).toBe(0);
      expect(result.documents).toHaveLength(1);
      expect(result.documents![0]).toEqual(documentSchema.parse(validDocument));
    });

    it('should reject data without documents or documentErrors', () => {
      const schema = createMDocObjectSchema('TestMDoc');
      const invalidData = {
        version: '1.0' as const,
        status: 0,
      };

      try {
        schema.parse(invalidData);
        expect.unreachable('Expected parsing to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues[0].message).toBe(
          mdocAtLeastOneDocumentOrErrorMessage('TestMDoc')
        );
      }
    });
  });

  describe('mdocSchema', () => {
    describe('valid cases', () => {
      it('should accept valid MDoc with documents only', () => {
        const validMDoc = new Map<string, unknown>([
          ['version', '1.0'],
          ['documents', [validDocument]],
          ['status', 0],
        ]);

        const result = mdocSchema.parse(validMDoc);

        expect(result.version).toBe('1.0');
        expect(result.status).toBe(0);
        expect(result.documents).toHaveLength(1);
        expect(result.documents![0]).toEqual(
          documentSchema.parse(validDocument)
        );
        expect(result.documentErrors).toBeUndefined();
      });

      it('should accept valid MDoc with documentErrors only', () => {
        const validMDoc = new Map<string, unknown>([
          ['version', '1.0'],
          ['documentErrors', [validDocumentError]],
          ['status', 10],
        ]);

        const result = mdocSchema.parse(validMDoc);

        expect(result.version).toBe('1.0');
        expect(result.status).toBe(10);
        expect(result.documentErrors).toHaveLength(1);
        expect(result.documentErrors![0]).toEqual(validDocumentError);
        expect(result.documents).toBeUndefined();
      });

      it('should accept valid MDoc with both documents and documentErrors', () => {
        const validMDoc = new Map<string, unknown>([
          ['version', '1.0'],
          ['documents', [validDocument]],
          ['documentErrors', [validDocumentError]],
          ['status', 0],
        ]);

        const result = mdocSchema.parse(validMDoc);

        expect(result.version).toBe('1.0');
        expect(result.status).toBe(0);
        expect(result.documents).toHaveLength(1);
        expect(result.documents![0]).toEqual(
          documentSchema.parse(validDocument)
        );
        expect(result.documentErrors).toHaveLength(1);
        expect(result.documentErrors![0]).toEqual(validDocumentError);
      });

      it('should accept valid MDoc with multiple documents', () => {
        const validDocument2 = new Map<string, unknown>([
          ['docType', 'com.example.document2'],
          [
            'issuerSigned',
            new Map<string, unknown>([
              [
                'nameSpaces',
                new Map([
                  [
                    'org.iso.18013.5.2',
                    [
                      createTag24(
                        new Map<string, unknown>([
                          ['digestID', 2],
                          ['random', Uint8Array.from([])],
                          ['elementIdentifier', 'field1'],
                          ['elementValue', 'value1'],
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
        ]);

        const validMDoc = new Map<string, unknown>([
          ['version', '1.0'],
          ['documents', [validDocument, validDocument2]],
          ['status', 0],
        ]);

        const result = mdocSchema.parse(validMDoc);

        expect(result.version).toBe('1.0');
        expect(result.status).toBe(0);
        expect(result.documents).toHaveLength(2);
        expect(result.documents![0]).toEqual(
          documentSchema.parse(validDocument)
        );
        expect(result.documents![1]).toEqual(
          documentSchema.parse(validDocument2)
        );
      });

      it('should accept MDoc with all valid status codes', () => {
        const statusCodes = [0, 10, 11, 12];

        statusCodes.forEach((statusCode) => {
          const validMDoc = new Map<string, unknown>([
            ['version', '1.0'],
            ['documents', [validDocument]],
            ['status', statusCode],
          ]);

          const result = mdocSchema.parse(validMDoc);
          expect(result.status).toBe(statusCode);
        });
      });
    });

    describe('auth0/mdl compatibility', () => {
      it('should parse auth0/mdl created MDoc', async () => {
        const { ...publicKeyJWK } = DEVICE_JWK;
        const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

        const signed = new Date('2024-01-01T00:00:00Z');
        const validFrom = new Date('2024-01-01T01:00:00Z');
        const validUntil = new Date('2025-01-01T00:00:00Z');

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
          })
          .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
          .sign({
            issuerPrivateKey,
            issuerCertificate: ISSUER_CERTIFICATE,
            alg: 'ES256',
          });

        const mdoc = new Auth0MDoc([document]);
        const encoded = mdoc.encode();

        // Decode the CBOR to get raw structure
        const decoded = decodeCbor(encoded) as Map<string, unknown>;

        // Parse with mdocSchema
        const validated = mdocSchema.parse(decoded);

        // Verify MDoc structure
        expect(validated.version).toBe('1.0');
        expect(validated.status).toBe(0);
        expect(validated.documents).toHaveLength(1);
        expect(validated.documents![0].docType).toBe('org.iso.18013.5.1.mDL');
        expect(validated.documents![0].issuerSigned).toBeDefined();
      });

      it('should parse auth0/mdl created MDoc with multiple documents', async () => {
        const { ...publicKeyJWK } = DEVICE_JWK;
        const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

        const signed = new Date('2024-01-01T00:00:00Z');
        const validFrom = new Date('2024-01-01T01:00:00Z');
        const validUntil = new Date('2025-01-01T00:00:00Z');

        // Create two documents
        const document1 = await new Document('org.iso.18013.5.1.mDL')
          .addIssuerNameSpace('org.iso.18013.5.1', {
            family_name: 'Doe',
            given_name: 'John',
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

        const document2 = await new Document('com.example.document')
          .addIssuerNameSpace('com.example.namespace', {
            field1: 'value1',
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

        const mdoc = new Auth0MDoc([document1, document2]);
        const encoded = mdoc.encode();

        // Decode the CBOR to get raw structure
        const decoded = decodeCbor(encoded) as Map<string, unknown>;

        // Parse with mdocSchema
        const validated = mdocSchema.parse(decoded);

        // Verify MDoc structure
        expect(validated.version).toBe('1.0');
        expect(validated.status).toBe(0);
        expect(validated.documents).toHaveLength(2);
        expect(validated.documents![0].docType).toBe('org.iso.18013.5.1.mDL');
        expect(validated.documents![1].docType).toBe('com.example.document');
      });
    });

    describe('invalid cases', () => {
      it('should reject MDoc without documents or documentErrors', () => {
        const invalidMDoc = new Map<string, unknown>([
          ['version', '1.0'],
          ['status', 0],
        ]);

        try {
          mdocSchema.parse(invalidMDoc);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues[0].message).toBe(
            mdocAtLeastOneDocumentOrErrorMessage('MDoc')
          );
        }
      });

      it('should reject MDoc with invalid version', () => {
        const invalidMDoc = new Map<string, unknown>([
          ['version', '2.0'],
          ['documents', [validDocument]],
          ['status', 0],
        ]);

        try {
          mdocSchema.parse(invalidMDoc);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues[0].message).toBe(
            VERSION_INVALID_VALUE_MESSAGE
          );
        }
      });

      it('should reject MDoc with invalid status code', () => {
        const invalidMDoc = new Map<string, unknown>([
          ['version', '1.0'],
          ['documents', [validDocument]],
          ['status', 999],
        ]);

        try {
          mdocSchema.parse(invalidMDoc);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues[0].message).toBe(
            'Status: Invalid status code. Allowed values are 0, 10, 11, 12.'
          );
        }
      });

      it('should reject MDoc with missing version', () => {
        const invalidMDoc = new Map<string, unknown>([
          ['documents', [validDocument]],
          ['status', 0],
        ]);

        try {
          mdocSchema.parse(invalidMDoc);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues[0].message).toContain('Version');
        }
      });

      it('should reject MDoc with missing status', () => {
        const invalidMDoc = new Map<string, unknown>([
          ['version', '1.0'],
          ['documents', [validDocument]],
        ]);

        try {
          mdocSchema.parse(invalidMDoc);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues[0].message).toContain('Status');
        }
      });

      const invalidTypeCases: Array<{
        name: string;
        input: unknown;
        expected: string;
      }> = [
        {
          name: 'null input',
          input: null,
          expected: requiredMessage('MDoc'),
        },
        {
          name: 'undefined input',
          input: undefined,
          expected: requiredMessage('MDoc'),
        },
        {
          name: 'boolean input',
          input: true,
          expected: mapInvalidTypeMessage('MDoc'),
        },
        {
          name: 'number input',
          input: 123,
          expected: mapInvalidTypeMessage('MDoc'),
        },
        {
          name: 'string input',
          input: 'string',
          expected: mapInvalidTypeMessage('MDoc'),
        },
        {
          name: 'array input',
          input: [],
          expected: mapInvalidTypeMessage('MDoc'),
        },
        {
          name: 'plain object input',
          input: {},
          expected: mapInvalidTypeMessage('MDoc'),
        },
      ];

      invalidTypeCases.forEach(({ name, input, expected }) => {
        it(`should reject ${name}`, () => {
          try {
            mdocSchema.parse(input as never);
            expect.unreachable('Expected parsing to throw');
          } catch (error) {
            expect(error).toBeInstanceOf(ZodError);
            const zodError = error as ZodError;
            expect(zodError.issues[0].message).toBe(expected);
          }
        });
      });

      it('should reject MDoc with empty documents array', () => {
        const invalidMDoc = new Map<string, unknown>([
          ['version', '1.0'],
          ['documents', []],
          ['status', 0],
        ]);

        try {
          mdocSchema.parse(invalidMDoc);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          // Should fail on at least one document or documentError validation
          expect(zodError.issues[0].message).toContain('documents');
        }
      });

      it('should reject MDoc with empty documentErrors array', () => {
        const invalidMDoc = new Map<string, unknown>([
          ['version', '1.0'],
          ['documentErrors', []],
          ['status', 0],
        ]);

        try {
          mdocSchema.parse(invalidMDoc);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          // Should fail on at least one document or documentError validation
          expect(zodError.issues[0].message).toContain('documentErrors');
        }
      });
    });
  });

  describe('MDoc type', () => {
    it('should have correct type structure', () => {
      const schema = createMDocSchema('MDoc');
      const validMDoc = new Map<string, unknown>([
        ['version', '1.0'],
        ['documents', [validDocument]],
        ['status', 0],
      ]);

      const result: MDoc = schema.parse(validMDoc);

      expect(result.version).toBe('1.0');
      expect(result.status).toBe(0);
      expect(result.documents).toHaveLength(1);
      expect(result.documents![0]).toEqual(documentSchema.parse(validDocument));
    });
  });
});
