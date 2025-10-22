import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { documentSchema } from '../Document';
import { issuerSignedSchema } from '../IssuerSigned';
import { errorsSchema } from '../Errors';
import { deviceSignedSchema } from '../DeviceSigned';
import { createTag17, type Tag17Content } from '@/cbor/createTag17';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { createTag24 } from '@/cbor/createTag24';
import { getTypeName } from '@/utils/getTypeName';
import {
  containerInvalidTypeMessage,
  containerInvalidValueMessage,
} from '@/schemas/messages';
import { strictMapMissingKeysMessage } from '@/schemas/containers/StrictMap';

const createMinimalIssuerSigned = (): Map<string, unknown> => {
  const ns = new Map<string, unknown>([
    ['org.iso.18013.5.1', [createTag24(new Uint8Array([]))]],
  ]);
  const issuerAuthTuple = [
    new Uint8Array([]),
    new Map<number, unknown>(),
    null,
    new Uint8Array([]),
  ] as Tag18Content;
  return issuerSignedSchema.parse(
    new Map<string, unknown>([
      ['nameSpaces', ns],
      ['issuerAuth', createTag18(issuerAuthTuple)],
    ])
  ) as Map<string, unknown>;
};

const createMinimalDeviceSigned = (): Map<string, unknown> => {
  const sign1Tuple = [
    new Uint8Array([]),
    new Map<number, unknown>(),
    null,
    new Uint8Array([]),
  ] as Tag18Content;
  const mac0Tuple = [
    new Uint8Array([]),
    new Map<number, unknown>(),
    null,
    new Uint8Array([]),
  ] as Tag17Content;
  return deviceSignedSchema.parse(
    new Map<string, unknown>([
      ['nameSpaces', createTag24(new Map())],
      [
        'deviceAuth',
        new Map<string, unknown>([
          ['deviceSignature', createTag18(sign1Tuple)],
          ['deviceMac', createTag17(mac0Tuple)],
        ]),
      ],
    ])
  ) as Map<string, unknown>;
};

const createMinimalErrors = (): Map<string, unknown> => {
  return new Map<string, unknown>([
    ['org.iso.18013.5.1', new Map<string, number>([['given_name', 0]])],
  ]);
};

describe('Document', () => {
  describe('should accept valid Document maps', () => {
    const issuerSigned = createMinimalIssuerSigned();
    const deviceSigned = createMinimalDeviceSigned();
    const errors = createMinimalErrors();

    const testCases = [
      {
        name: 'issuerSigned only',
        input: new Map<string, unknown>([
          ['docType', 'org.iso.18013.5.1.mDL'],
          ['issuerSigned', issuerSigned],
        ]),
      },
      {
        name: 'issuerSigned with deviceSigned',
        input: new Map<string, unknown>([
          ['docType', 'org.iso.18013.5.1.mDL'],
          ['issuerSigned', issuerSigned],
          ['deviceSigned', deviceSigned],
        ]),
      },
      {
        name: 'issuerSigned with errors',
        input: new Map<string, unknown>([
          ['docType', 'org.iso.18013.5.1.mDL'],
          ['issuerSigned', issuerSigned],
          ['errors', errors],
        ]),
      },
      {
        name: 'issuerSigned with deviceSigned and errors',
        input: new Map<string, unknown>([
          ['docType', 'org.iso.18013.5.1.mDL'],
          ['issuerSigned', issuerSigned],
          ['deviceSigned', deviceSigned],
          ['errors', errors],
        ]),
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = documentSchema.parse(input);
        expect(result).toBeInstanceOf(Map);
        expect(result).toEqual(input);
      });
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: containerInvalidTypeMessage({
          target: 'Document',
          expected: 'Map',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: containerInvalidTypeMessage({
          target: 'Document',
          expected: 'Map',
          received: getTypeName(undefined),
        }),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: containerInvalidTypeMessage({
          target: 'Document',
          expected: 'Map',
          received: getTypeName(true),
        }),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: containerInvalidTypeMessage({
          target: 'Document',
          expected: 'Map',
          received: getTypeName(123),
        }),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: containerInvalidTypeMessage({
          target: 'Document',
          expected: 'Map',
          received: getTypeName('string'),
        }),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: containerInvalidTypeMessage({
          target: 'Document',
          expected: 'Map',
          received: getTypeName([]),
        }),
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: containerInvalidTypeMessage({
          target: 'Document',
          expected: 'Map',
          received: getTypeName({}),
        }),
      },
    ];

    it('should throw the expected message for all invalid type inputs', () => {
      testCases.forEach(({ input, expectedMessage }) => {
        try {
          documentSchema.parse(input as unknown);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('should enforce required keys and value constraints', () => {
    it('should report both missing required keys on empty map', () => {
      try {
        documentSchema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          strictMapMissingKeysMessage('Document', ['docType', 'issuerSigned'])
        );
      }
    });

    it('should report missing issuerSigned when only docType is provided', () => {
      try {
        documentSchema.parse(new Map([['docType', 'org.iso.18013.5.1.mDL']]));
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          strictMapMissingKeysMessage('Document', ['issuerSigned'])
        );
      }
    });

    it('should report missing docType when only issuerSigned is provided', () => {
      try {
        documentSchema.parse(
          new Map([['issuerSigned', createMinimalIssuerSigned()]])
        );
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          strictMapMissingKeysMessage('Document', ['docType'])
        );
      }
    });

    it('should reject empty docType string', () => {
      try {
        documentSchema.parse(
          new Map<string, unknown>([
            ['docType', ''],
            ['issuerSigned', createMinimalIssuerSigned()],
          ])
        );
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          containerInvalidValueMessage({
            target: 'Document',
            path: ['docType'],
            originalMessage: 'String must contain at least 1 character(s)',
          })
        );
      }
    });

    it('should reject null issuerSigned', () => {
      try {
        documentSchema.parse(
          new Map([
            ['docType', 'org.iso.18013.5.1.mDL'],
            ['issuerSigned', null],
          ])
        );
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          containerInvalidValueMessage({
            target: 'Document',
            path: ['issuerSigned'],
            originalMessage: 'Expected Map, received null',
          })
        );
      }
    });

    it('should reject invalid deviceSigned type', () => {
      const issuerSigned = createMinimalIssuerSigned();
      try {
        documentSchema.parse(
          new Map<string, unknown>([
            ['docType', 'org.iso.18013.5.1.mDL'],
            ['issuerSigned', issuerSigned],
            ['deviceSigned', 'not-a-map'],
          ])
        );
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          containerInvalidValueMessage({
            target: 'Document',
            path: ['deviceSigned'],
            originalMessage: 'Expected Map, received string',
          })
        );
      }
    });

    it('should strip unknown keys', () => {
      const issuerSigned = createMinimalIssuerSigned();
      const input = new Map<string, unknown>([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned],
        ['unknown', 123],
      ]);
      const expected = new Map<string, unknown>([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned],
      ]);
      const result = documentSchema.parse(input);
      expect(result).toEqual(expected);
    });
  });
});
