import { Mac0 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  deviceMacSchema,
  DEVICE_MAC_INVALID_TYPE_MESSAGE,
  DEVICE_MAC_REQUIRED_MESSAGE,
  DEVICE_MAC_TOO_FEW_MESSAGE,
  DEVICE_MAC_TOO_MANY_MESSAGE,
} from '../DeviceMac';
import { mapInvalidTypeMessage } from '@/schemas/common/Map';

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
        expectedMessage: DEVICE_MAC_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: DEVICE_MAC_REQUIRED_MESSAGE,
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: DEVICE_MAC_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: DEVICE_MAC_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: DEVICE_MAC_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: DEVICE_MAC_INVALID_TYPE_MESSAGE,
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
        expectedMessage: DEVICE_MAC_TOO_FEW_MESSAGE,
      },
      {
        name: 'array with 1 element',
        input: [Buffer.from([])],
        expectedMessage: DEVICE_MAC_TOO_FEW_MESSAGE,
      },
      {
        name: 'array with 2 elements',
        input: [Buffer.from([]), new Map()],
        expectedMessage: DEVICE_MAC_TOO_FEW_MESSAGE,
      },
      {
        name: 'array with 3 elements',
        input: [Buffer.from([]), new Map(), Buffer.from([])],
        expectedMessage: DEVICE_MAC_TOO_FEW_MESSAGE,
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
        expectedMessage: DEVICE_MAC_TOO_MANY_MESSAGE,
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
          deviceMacSchema.parse(input);
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
        expectedMessage: mapInvalidTypeMessage('UnprotectedHeaders'),
      },
      {
        name: 'number instead of Map',
        input: [Buffer.from([]), 123, Buffer.from([]), Buffer.from([])],
        expectedMessage: mapInvalidTypeMessage('UnprotectedHeaders'),
      },
      {
        name: 'boolean instead of Map',
        input: [Buffer.from([]), true, Buffer.from([]), Buffer.from([])],
        expectedMessage: mapInvalidTypeMessage('UnprotectedHeaders'),
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
          deviceMacSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('should throw error for array with invalid tag', () => {
    const testCases = [
      {
        name: 'string instead of Buffer',
        input: [Buffer.from([]), new Map(), Buffer.from([]), 'string'],
        expectedMessage:
          'Tag: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'number instead of Buffer',
        input: [Buffer.from([]), new Map(), Buffer.from([]), 123],
        expectedMessage:
          'Tag: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        name: 'boolean instead of Buffer',
        input: [Buffer.from([]), new Map(), Buffer.from([]), true],
        expectedMessage:
          'Tag: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
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
});
