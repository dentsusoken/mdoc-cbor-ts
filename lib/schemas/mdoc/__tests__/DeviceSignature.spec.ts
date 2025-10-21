import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceSignatureSchema } from '../DeviceSignature';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('DeviceSignature', () => {
  it('should accept valid Sign1 tuple', () => {
    const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]);
    const unprotectedHeaders = new Map<number, unknown>([
      [4, new Uint8Array([1, 2, 3])],
    ]);
    const payload = new Uint8Array([0x48, 0x65, 0x6c, 0x6f]);
    const signature = new Uint8Array([
      0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
    ]);
    const input = [protectedHeaders, unprotectedHeaders, payload, signature];

    const result = deviceSignatureSchema.parse(input);
    expect(result.tag).toBe(18);
    expect(result.value).toEqual(input);
  });

  describe('should throw error for invalid type inputs', () => {
    const TARGET = 'DeviceSignature';
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'null input',
        input: null,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(18)',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(18)',
          received: getTypeName(undefined),
        }),
      },
      {
        name: 'boolean input',
        input: true,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(18)',
          received: getTypeName(true),
        }),
      },
      {
        name: 'number input',
        input: 123,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(18)',
          received: getTypeName(123),
        }),
      },
      {
        name: 'string input',
        input: 'string',
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(18)',
          received: getTypeName('string'),
        }),
      },
      {
        name: 'object input',
        input: {},
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(18)',
          received: getTypeName({}),
        }),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceSignatureSchema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should throw error for array with wrong length', () => {
    const TARGET = 'DeviceSignature';

    const tooFewCases: unknown[][] = [
      [],
      [new Uint8Array([])],
      [new Uint8Array([]), new Map()],
      [new Uint8Array([]), new Map(), new Uint8Array([])],
    ];

    tooFewCases.forEach((input, idx) => {
      it(`should throw error for too few elements case ${idx + 1}`, () => {
        try {
          deviceSignatureSchema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          const issue = zodError.issues[0];
          expect(issue.message.startsWith(`${TARGET}`)).toBe(true);
        }
      });
    });

    it('should throw error for too many elements', () => {
      const input = [
        new Uint8Array([]),
        new Map(),
        new Uint8Array([]),
        new Uint8Array([]),
        new Uint8Array([]),
      ];
      try {
        deviceSignatureSchema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.message.startsWith(`${TARGET}`)).toBe(true);
      }
    });
  });
});
