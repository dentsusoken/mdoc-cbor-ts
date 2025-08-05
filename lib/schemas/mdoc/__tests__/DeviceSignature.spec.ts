import { Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceSignatureSchema } from '../DeviceSignature';

describe('DeviceSignature', () => {
  it('should accept valid Sign1 objects', () => {
    const sign1 = new Sign1(
      Buffer.from([]), // protected headers (empty for test)
      new Map<number, string>([
        [1, 'value'],
        [2, 'another'],
      ]), // unprotected headers
      Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]), // payload ("Hello")
      Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]) // signature
    );
    const validSignature = sign1.getContentForEncoding();

    const result = deviceSignatureSchema.parse(validSignature);
    expect(result).toBeInstanceOf(Sign1);
    expect(result.protectedHeaders).toEqual(sign1.protectedHeaders);
    expect(result.unprotectedHeaders).toEqual(sign1.unprotectedHeaders);
    expect(result.payload).toEqual(sign1.payload);
    expect(result.signature).toEqual(sign1.signature);
  });

  it('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        input: null,
        expectedMessage: 'Expected array, received null',
      },
      {
        input: undefined,
        expectedMessage: 'Required',
      },
      {
        input: true,
        expectedMessage: 'Expected array, received boolean',
      },
      {
        input: 123,
        expectedMessage: 'Expected array, received number',
      },
      {
        input: 'string',
        expectedMessage: 'Expected array, received string',
      },
      {
        input: {},
        expectedMessage: 'Expected array, received object',
      },
    ];

    testCases.forEach((testCase) => {
      try {
        deviceSignatureSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    });
  });

  it('should throw error for array with too few elements', () => {
    const testCases = [
      {
        input: [],
        expectedMessage: 'Array must contain at least 4 element(s)',
      },
      {
        input: [Buffer.from([])],
        expectedMessage: 'Array must contain at least 4 element(s)',
      },
      {
        input: [Buffer.from([]), new Map()],
        expectedMessage: 'Array must contain at least 4 element(s)',
      },
      {
        input: [Buffer.from([]), new Map(), Buffer.from([])],
        expectedMessage: 'Array must contain at least 4 element(s)',
      },
    ];

    for (const testCase of testCases) {
      try {
        deviceSignatureSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    }
  });

  it('should throw error for array with too many elements', () => {
    const testCases = [
      {
        input: [
          Buffer.from([]),
          new Map(),
          Buffer.from([]),
          Buffer.from([]),
          Buffer.from([]), // 5 elements
        ],
        expectedMessage: 'Array must contain at most 4 element(s)',
      },
    ];

    for (const testCase of testCases) {
      try {
        deviceSignatureSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    }
  });

  it('should throw error for array with invalid protected headers', () => {
    const testCases = [
      {
        input: ['string', new Map(), Buffer.from([]), Buffer.from([])], // string instead of Buffer
        expectedMessage:
          'ProtectedHeaders: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        input: [123, new Map(), Buffer.from([]), Buffer.from([])], // number instead of Buffer
        expectedMessage:
          'ProtectedHeaders: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        input: [true, new Map(), Buffer.from([]), Buffer.from([])], // boolean instead of Buffer
        expectedMessage:
          'ProtectedHeaders: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
    ];

    for (const testCase of testCases) {
      try {
        deviceSignatureSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    }
  });

  it('should throw error for array with invalid unprotected headers', () => {
    const testCases = [
      {
        input: [Buffer.from([]), 'string', Buffer.from([]), Buffer.from([])], // string instead of Map
        expectedMessage:
          'UnprotectedHeaders: Please provide a valid number map (object or Map)',
      },
      {
        input: [Buffer.from([]), 123, Buffer.from([]), Buffer.from([])], // number instead of Map
        expectedMessage:
          'UnprotectedHeaders: Please provide a valid number map (object or Map)',
      },
      {
        input: [Buffer.from([]), true, Buffer.from([]), Buffer.from([])], // boolean instead of Map
        expectedMessage:
          'UnprotectedHeaders: Please provide a valid number map (object or Map)',
      },
    ];

    for (const testCase of testCases) {
      try {
        deviceSignatureSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    }
  });

  it('should throw error for array with invalid payload', () => {
    const testCases = [
      {
        input: [Buffer.from([]), new Map(), 'string', Buffer.from([])], // string instead of Buffer
        expectedMessage:
          'Payload: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        input: [Buffer.from([]), new Map(), 123, Buffer.from([])], // number instead of Buffer
        expectedMessage:
          'Payload: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        input: [Buffer.from([]), new Map(), true, Buffer.from([])], // boolean instead of Buffer
        expectedMessage:
          'Payload: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
    ];

    for (const testCase of testCases) {
      try {
        deviceSignatureSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    }
  });

  it('should throw error for array with invalid signature', () => {
    const testCases = [
      {
        input: [Buffer.from([]), new Map(), Buffer.from([]), 'string'], // string instead of Buffer
        expectedMessage:
          'Signature: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        input: [Buffer.from([]), new Map(), Buffer.from([]), 123], // number instead of Buffer
        expectedMessage:
          'Signature: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        input: [Buffer.from([]), new Map(), Buffer.from([]), true], // boolean instead of Buffer
        expectedMessage:
          'Signature: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
    ];

    for (const testCase of testCases) {
      try {
        deviceSignatureSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    }
  });
});
