import { Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceSignatureSchema } from '../DeviceSignature';
import { requiredMessage } from '@/schemas/common/Required';
import {
  fixedTupleLengthInvalidTypeMessage,
  fixedTupleLengthTooFewMessage,
  fixedTupleLengthTooManyMessage,
} from '@/schemas/common/FixedTupleLength';

describe('DeviceSignature', () => {
  it('should accept valid Sign1 objects', () => {
    const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]); // CBOR-encoded {1: -7}
    const unprotectedHeaders = new Map<number, unknown>([
      [4, new Uint8Array([1, 2, 3])],
    ]);
    const payload = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    const signature = new Uint8Array([
      0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
    ]); // signature
    const input = [protectedHeaders, unprotectedHeaders, payload, signature];

    const result = deviceSignatureSchema.parse(input);
    expect(result).toBeInstanceOf(Sign1);
    expect(result).toEqual(
      new Sign1(protectedHeaders, unprotectedHeaders, payload, signature)
    );
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('DeviceSignature'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('DeviceSignature'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: fixedTupleLengthInvalidTypeMessage('DeviceSignature'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: fixedTupleLengthInvalidTypeMessage('DeviceSignature'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: fixedTupleLengthInvalidTypeMessage('DeviceSignature'),
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: fixedTupleLengthInvalidTypeMessage('DeviceSignature'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceSignatureSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('should throw error for array with too few elements', () => {
    const testCases = [
      {
        name: 'empty array',
        input: [],
        expectedMessage: fixedTupleLengthTooFewMessage('DeviceSignature', 4),
      },
      {
        name: 'array with 1 element',
        input: [Buffer.from([])],
        expectedMessage: fixedTupleLengthTooFewMessage('DeviceSignature', 4),
      },
      {
        name: 'array with 2 elements',
        input: [Buffer.from([]), new Map()],
        expectedMessage: fixedTupleLengthTooFewMessage('DeviceSignature', 4),
      },
      {
        name: 'array with 3 elements',
        input: [Buffer.from([]), new Map(), Buffer.from([])],
        expectedMessage: fixedTupleLengthTooFewMessage('DeviceSignature', 4),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceSignatureSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('should throw error for array with too many elements', () => {
    const testCases = [
      {
        name: 'array with 5 elements',
        input: [
          Buffer.from([]),
          new Map(),
          Buffer.from([]),
          Buffer.from([]),
          Buffer.from([]), // 5 elements
        ],
        expectedMessage: fixedTupleLengthTooManyMessage('DeviceSignature', 4),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceSignatureSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });
});
