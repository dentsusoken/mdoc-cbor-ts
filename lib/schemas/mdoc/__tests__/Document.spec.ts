import { describe, expect, it } from 'vitest';
import { documentSchema } from '../Document';
import { createTag24 } from '@/cbor/createTag24';
import { mapInvalidTypeMessage } from '@/schemas/common/Map';
import { requiredMessage } from '@/schemas/common/Required';

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
