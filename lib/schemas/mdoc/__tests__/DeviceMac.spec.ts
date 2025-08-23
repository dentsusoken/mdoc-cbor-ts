import { Mac0 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceMacSchema } from '../DeviceMac';
import { requiredMessage } from '@/schemas/common/Required';
import {
  fixedTupleLengthInvalidTypeMessage,
  fixedTupleLengthTooFewMessage,
  fixedTupleLengthTooManyMessage,
} from '@/schemas/common/FixedTupleLength';
// mapInvalidTypeMessage is tested in UnprotectedHeaders schema; not needed here

describe('DeviceMac', () => {
  it('should accept valid Mac0 objects', () => {
    const mac0 = new Mac0(
      Uint8Array.from([]), // protected headers (empty for test)
      new Map<number, string>([
        [1, 'value'],
        [2, 'another'],
      ]), // unprotected headers
      Uint8Array.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]), // payload ("Hello")
      Uint8Array.from([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]) // tag (MAC)
    );
    const validMac = mac0.getContentForEncoding();

    const result = deviceMacSchema.parse(validMac);
    expect(result).toBeInstanceOf(Mac0);
    expect(result.protectedHeaders).toEqual(mac0.protectedHeaders);
    expect(result.unprotectedHeaders).toEqual(mac0.unprotectedHeaders);
    expect(result.payload).toEqual(mac0.payload);
    expect(result.tag).toEqual(mac0.tag);
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('DeviceMac'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('DeviceMac'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: fixedTupleLengthInvalidTypeMessage('DeviceMac'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: fixedTupleLengthInvalidTypeMessage('DeviceMac'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: fixedTupleLengthInvalidTypeMessage('DeviceMac'),
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: fixedTupleLengthInvalidTypeMessage('DeviceMac'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceMacSchema.parse(input);
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
        expectedMessage: fixedTupleLengthTooFewMessage('DeviceMac', 4),
      },
      {
        name: 'array with 1 element',
        input: [Buffer.from([])],
        expectedMessage: fixedTupleLengthTooFewMessage('DeviceMac', 4),
      },
      {
        name: 'array with 2 elements',
        input: [Buffer.from([]), new Map()],
        expectedMessage: fixedTupleLengthTooFewMessage('DeviceMac', 4),
      },
      {
        name: 'array with 3 elements',
        input: [Buffer.from([]), new Map(), Buffer.from([])],
        expectedMessage: fixedTupleLengthTooFewMessage('DeviceMac', 4),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceMacSchema.parse(input);
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
        expectedMessage: fixedTupleLengthTooManyMessage('DeviceMac', 4),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceMacSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  // Per-element invalid cases (protected/unprotected/payload/tag) are tested in their own schema tests.
});
