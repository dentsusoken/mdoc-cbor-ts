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

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'DeviceSignature: Expected an array with 4 elements (protected headers, unprotected headers, payload, signature). Please provide a valid COSE_Sign1 structure.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'DeviceSignature: This field is required. Please provide a COSE_Sign1 signature array.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'DeviceSignature: Expected an array with 4 elements (protected headers, unprotected headers, payload, signature). Please provide a valid COSE_Sign1 structure.',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'DeviceSignature: Expected an array with 4 elements (protected headers, unprotected headers, payload, signature). Please provide a valid COSE_Sign1 structure.',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'DeviceSignature: Expected an array with 4 elements (protected headers, unprotected headers, payload, signature). Please provide a valid COSE_Sign1 structure.',
      },
      {
        name: 'object input',
        input: {},
        expectedMessage:
          'DeviceSignature: Expected an array with 4 elements (protected headers, unprotected headers, payload, signature). Please provide a valid COSE_Sign1 structure.',
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
        expectedMessage: 'Array must contain at least 4 element(s)',
      },
      {
        name: 'array with 1 element',
        input: [Buffer.from([])],
        expectedMessage: 'Array must contain at least 4 element(s)',
      },
      {
        name: 'array with 2 elements',
        input: [Buffer.from([]), new Map()],
        expectedMessage: 'Array must contain at least 4 element(s)',
      },
      {
        name: 'array with 3 elements',
        input: [Buffer.from([]), new Map(), Buffer.from([])],
        expectedMessage: 'Array must contain at least 4 element(s)',
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
        expectedMessage: 'Array must contain at most 4 element(s)',
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

  describe('should throw error for array with invalid protected headers', () => {
    const testCases = [
      {
        name: 'string instead of Buffer',
        input: ['string', new Map(), Buffer.from([]), Buffer.from([])],
        expectedMessage:
          'ProtectedHeaders: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'number instead of Buffer',
        input: [123, new Map(), Buffer.from([]), Buffer.from([])],
        expectedMessage:
          'ProtectedHeaders: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'boolean instead of Buffer',
        input: [true, new Map(), Buffer.from([]), Buffer.from([])],
        expectedMessage:
          'ProtectedHeaders: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
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

  describe('should throw error for array with invalid unprotected headers', () => {
    const testCases = [
      {
        name: 'string instead of Map',
        input: [Buffer.from([]), 'string', Buffer.from([]), Buffer.from([])],
        expectedMessage:
          'UnprotectedHeaders: Please provide a valid number map (object or Map)',
      },
      {
        name: 'number instead of Map',
        input: [Buffer.from([]), 123, Buffer.from([]), Buffer.from([])],
        expectedMessage:
          'UnprotectedHeaders: Please provide a valid number map (object or Map)',
      },
      {
        name: 'boolean instead of Map',
        input: [Buffer.from([]), true, Buffer.from([]), Buffer.from([])],
        expectedMessage:
          'UnprotectedHeaders: Please provide a valid number map (object or Map)',
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

  describe('should throw error for array with invalid payload', () => {
    const testCases = [
      {
        name: 'string instead of Buffer',
        input: [Buffer.from([]), new Map(), 'string', Buffer.from([])],
        expectedMessage:
          'Payload: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'number instead of Buffer',
        input: [Buffer.from([]), new Map(), 123, Buffer.from([])],
        expectedMessage:
          'Payload: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'boolean instead of Buffer',
        input: [Buffer.from([]), new Map(), true, Buffer.from([])],
        expectedMessage:
          'Payload: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
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

  describe('should throw error for array with invalid signature', () => {
    const testCases = [
      {
        name: 'string instead of Buffer',
        input: [Buffer.from([]), new Map(), Buffer.from([]), 'string'],
        expectedMessage:
          'Signature: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'number instead of Buffer',
        input: [Buffer.from([]), new Map(), Buffer.from([]), 123],
        expectedMessage:
          'Signature: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'boolean instead of Buffer',
        input: [Buffer.from([]), new Map(), Buffer.from([]), true],
        expectedMessage:
          'Signature: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
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
