import { Mac0 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceMacSchema } from '../DeviceMac';

describe('DeviceMac', () => {
  it('should accept valid Mac0 objects', () => {
    const mac0 = new Mac0(
      Buffer.from([]), // protected headers (empty for test)
      new Map<number, string>([
        [1, 'value'],
        [2, 'another'],
      ]), // unprotected headers
      Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]), // payload ("Hello")
      Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]) // tag (MAC)
    );
    const validMac = mac0.getContentForEncoding();

    const result = deviceMacSchema.parse(validMac);
    expect(result).toBeInstanceOf(Mac0);
    expect(result.protectedHeaders).toEqual(mac0.protectedHeaders);
    expect(result.unprotectedHeaders).toEqual(mac0.unprotectedHeaders);
    expect(result.payload).toEqual(mac0.payload);
    expect(result.tag).toEqual(mac0.tag);
  });

  it('should throw error for null input', () => {
    try {
      deviceMacSchema.parse(null);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe('Expected array, received null');
    }
  });

  it('should throw error for undefined input', () => {
    try {
      deviceMacSchema.parse(undefined);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe('Required');
    }
  });

  it('should throw error for boolean input', () => {
    try {
      deviceMacSchema.parse(true);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Expected array, received boolean'
      );
    }
  });

  it('should throw error for number input', () => {
    try {
      deviceMacSchema.parse(123);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Invalid input: expected tuple, received number'
      );
    }
  });

  it('should throw error for string input', () => {
    try {
      deviceMacSchema.parse('string');
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Invalid input: expected tuple, received string'
      );
    }
  });

  it('should throw error for object input', () => {
    try {
      deviceMacSchema.parse({});
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Invalid input: expected tuple, received object'
      );
    }
  });

  it('should throw error for array with too few elements', () => {
    const testCases = [
      {
        input: [],
        expectedMessage: 'Too small: expected array to have >4 items',
      },
      {
        input: [Buffer.from([])],
        expectedMessage: 'Too small: expected array to have >4 items',
      },
      {
        input: [Buffer.from([]), new Map()],
        expectedMessage: 'Too small: expected array to have >4 items',
      },
      {
        input: [Buffer.from([]), new Map(), Buffer.from([])],
        expectedMessage:
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
    ];

    for (const testCase of testCases) {
      try {
        deviceMacSchema.parse(testCase.input);
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
        expectedMessage: 'Too big: expected array to have <4 items',
      },
    ];

    for (const testCase of testCases) {
      try {
        deviceMacSchema.parse(testCase.input);
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
        deviceMacSchema.parse(testCase.input);
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
        deviceMacSchema.parse(testCase.input);
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
        deviceMacSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    }
  });

  it('should throw error for array with invalid tag', () => {
    const testCases = [
      {
        input: [Buffer.from([]), new Map(), Buffer.from([]), 'string'], // string instead of Buffer
        expectedMessage:
          'Tag: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        input: [Buffer.from([]), new Map(), Buffer.from([]), 123], // number instead of Buffer
        expectedMessage:
          'Tag: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
      {
        input: [Buffer.from([]), new Map(), Buffer.from([]), true], // boolean instead of Buffer
        expectedMessage:
          'Tag: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.',
      },
    ];

    for (const testCase of testCases) {
      try {
        deviceMacSchema.parse(testCase.input);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(testCase.expectedMessage);
      }
    }
  });
});
