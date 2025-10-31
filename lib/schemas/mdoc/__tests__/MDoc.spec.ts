import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { mdocSchema } from '../MDoc';
import { documentSchema } from '../Document';
import { documentErrorSchema } from '../DocumentError';
import { issuerSignedSchema } from '../IssuerSigned';
import { deviceSignedSchema } from '../DeviceSigned';
import { createTag17, type Tag17Content } from '@/cbor/createTag17';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { createTag24 } from '@/cbor/createTag24';
import { MDocStatus } from '@/mdoc/types';
import { getTypeName } from '@/utils/getTypeName';
import {
  containerInvalidTypeMessage,
  containerInvalidValueMessage,
} from '@/schemas/messages';
import { strictMapMissingKeysMessage } from '@/schemas/containers/StrictMap';
import { containerEmptyMessage } from '@/schemas/messages/containerEmptyMessage';

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

//

const createMinimalDocument = (): Map<string, unknown> => {
  const issuerSigned = createMinimalIssuerSigned();
  const deviceSigned = createMinimalDeviceSigned();
  return documentSchema.parse(
    new Map<string, unknown>([
      ['docType', 'org.iso.18013.5.1.mDL'],
      ['issuerSigned', issuerSigned],
      ['deviceSigned', deviceSigned],
    ])
  ) as Map<string, unknown>;
};

const createMinimalDocumentError = (): Map<string, number> => {
  return documentErrorSchema.parse(
    new Map<string, number>([['org.iso.18013.5.1.mDL', 0]])
  );
};

describe('MDoc', (): void => {
  describe('should accept valid DeviceResponse maps', (): void => {
    it('with documents only', (): void => {
      const doc = createMinimalDocument();
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documents', [doc]],
        ['status', MDocStatus.OK],
      ]);
      const result = mdocSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(input);
    });

    it('with documentErrors only', (): void => {
      const docError = createMinimalDocumentError();
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documentErrors', [docError]],
        ['status', MDocStatus.CborValidationError],
      ]);
      const result = mdocSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(input);
    });

    it('with both documents and documentErrors', (): void => {
      const doc = createMinimalDocument();
      const docError = createMinimalDocumentError();
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documents', [doc]],
        ['documentErrors', [docError]],
        ['status', MDocStatus.OK],
      ]);
      const result = mdocSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(input);
    });

    it('with neither documents nor documentErrors', (): void => {
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['status', MDocStatus.CborDecodingError],
      ]);
      const result = mdocSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(input);
    });
  });

  describe('should throw error for invalid type inputs', (): void => {
    const expectedMessage = (v: unknown): string =>
      containerInvalidTypeMessage({
        target: 'MDoc',
        expected: 'Map',
        received: getTypeName(v),
      });

    const cases: Array<{ name: string; input: unknown }> = [
      { name: 'null input', input: null },
      { name: 'undefined input', input: undefined },
      { name: 'boolean input', input: true },
      { name: 'number input', input: 123 },
      { name: 'string input', input: 'str' },
      { name: 'array input', input: [] },
      { name: 'object input', input: {} },
    ];

    cases.forEach(({ name, input }) => {
      it(`should reject ${name}`, (): void => {
        try {
          mdocSchema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage(input));
        }
      });
    });
  });

  describe('should enforce required keys and value constraints', (): void => {
    it('should report missing required keys on empty map', (): void => {
      try {
        mdocSchema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          strictMapMissingKeysMessage('MDoc', ['version', 'status'])
        );
      }
    });

    it('should reject empty documents array when provided', (): void => {
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documents', []],
        ['status', MDocStatus.OK],
      ]);
      try {
        mdocSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          containerInvalidValueMessage({
            target: 'MDoc',
            path: ['documents'],
            originalMessage: containerEmptyMessage('documents'),
          })
        );
      }
    });

    it('should reject empty documentErrors array when provided', (): void => {
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documentErrors', []],
        ['status', MDocStatus.OK],
      ]);
      try {
        mdocSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          containerInvalidValueMessage({
            target: 'MDoc',
            path: ['documentErrors'],
            originalMessage: containerEmptyMessage('documentErrors'),
          })
        );
      }
    });

    // Exclusivity is no longer enforced; both previous rejection cases are now accepted in valid tests above.

    it('should reject invalid version value', (): void => {
      const doc = createMinimalDocument();
      const input = new Map<string, unknown>([
        ['version', '2.0'],
        ['documents', [doc]],
        ['status', MDocStatus.OK],
      ]);
      try {
        mdocSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          containerInvalidValueMessage({
            target: 'DeviceResponse',
            path: ['version'],
            originalMessage: 'Invalid literal value, expected "1.0"',
          })
        );
      }
    });

    it('should reject invalid documents item type', (): void => {
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documents', ['not-a-document']],
        ['status', MDocStatus.OK],
      ]);
      try {
        mdocSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        const expectedInnerMost = containerInvalidTypeMessage({
          target: 'Document',
          expected: 'Map',
          received: getTypeName('not-a-document'),
        });
        const expectedInner = containerInvalidValueMessage({
          target: 'documents',
          path: [0],
          originalMessage: expectedInnerMost,
        });
        const expected = containerInvalidValueMessage({
          target: 'MDoc',
          path: ['documents', 0],
          originalMessage: expectedInner,
        });
        expect(zodError.issues[0].message).toBe(expected);
      }
    });

    it('should reject invalid documentErrors item type', (): void => {
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documentErrors', ['not-a-document-error']],
        ['status', MDocStatus.OK],
      ]);
      try {
        mdocSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        const expectedInnerMost = containerInvalidTypeMessage({
          target: 'DocumentError',
          expected: 'Map',
          received: getTypeName('not-a-document-error'),
        });
        const expectedInner = containerInvalidValueMessage({
          target: 'documentErrors',
          path: [0],
          originalMessage: expectedInnerMost,
        });
        const expected = containerInvalidValueMessage({
          target: 'MDoc',
          path: ['documentErrors', 0],
          originalMessage: expectedInner,
        });
        expect(zodError.issues[0].message).toBe(expected);
      }
    });

    it('should reject invalid status enum value', (): void => {
      const doc = createMinimalDocument();
      const input = new Map<string, unknown>([
        ['version', '1.0'],
        ['documents', [doc]],
        ['status', 999],
      ]);
      try {
        mdocSchema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        // Build expected message using z.nativeEnum(ResponseStatus) to avoid hardcoding
        const enumResult = z.nativeEnum(MDocStatus).safeParse(999);
        const enumMessage = enumResult.success
          ? 'SHOULD_NOT_PASS'
          : enumResult.error.issues[0].message;
        const expected = containerInvalidValueMessage({
          target: 'MDoc',
          path: ['status'],
          originalMessage: enumMessage,
        });
        expect(zodError.issues[0].message).toBe(expected);
      }
    });
  });
});
