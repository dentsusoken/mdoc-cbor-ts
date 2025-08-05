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
        'Expected array, received number'
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
        'Expected array, received string'
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
        'Expected array, received object'
      );
    }
  });

  it('should throw error for array with too few elements', () => {
    const invalidArrays = [
      [], // empty
      [Buffer.from([])], // 1 element
      [Buffer.from([]), new Map()], // 2 elements
      [Buffer.from([]), new Map(), Buffer.from([])], // 3 elements
    ];

    for (const input of invalidArrays) {
      try {
        deviceMacSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Array must contain at least 4 element(s)'
        );
      }
    }
  });

  it('should throw error for array with too many elements', () => {
    const invalidArrays = [
      [
        Buffer.from([]),
        new Map(),
        Buffer.from([]),
        Buffer.from([]),
        Buffer.from([]),
      ], // 5 elements
    ];

    for (const input of invalidArrays) {
      try {
        deviceMacSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Array must contain at most 4 element(s)'
        );
      }
    }
  });

  it('should throw error for array with invalid protected headers', () => {
    const invalidProtectedHeaders = [
      [null, new Map(), Buffer.from([]), Buffer.from([])],
      [undefined, new Map(), Buffer.from([]), Buffer.from([])],
      [123, new Map(), Buffer.from([]), Buffer.from([])],
      ['string', new Map(), Buffer.from([]), Buffer.from([])],
      [{}, new Map(), Buffer.from([]), Buffer.from([])],
    ];

    for (const input of invalidProtectedHeaders) {
      try {
        deviceMacSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.'
        );
      }
    }
  });

  it('should throw error for array with invalid unprotected headers', () => {
    const invalidUnprotectedHeaders = [
      [Buffer.from([]), null, Buffer.from([]), Buffer.from([])],
      [Buffer.from([]), undefined, Buffer.from([]), Buffer.from([])],
      [Buffer.from([]), 123, Buffer.from([]), Buffer.from([])],
      [Buffer.from([]), 'string', Buffer.from([]), Buffer.from([])],
      [Buffer.from([]), [], Buffer.from([]), Buffer.from([])],
    ];

    for (const input of invalidUnprotectedHeaders) {
      try {
        deviceMacSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'NumberMap: Please provide a valid number map (object or Map)'
        );
      }
    }
  });

  it('should throw error for array with invalid payload', () => {
    const invalidPayloads = [
      [Buffer.from([]), new Map(), null, Buffer.from([])],
      [Buffer.from([]), new Map(), undefined, Buffer.from([])],
      [Buffer.from([]), new Map(), 123, Buffer.from([])],
      [Buffer.from([]), new Map(), 'string', Buffer.from([])],
      [Buffer.from([]), new Map(), {}, Buffer.from([])],
    ];

    for (const input of invalidPayloads) {
      try {
        deviceMacSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.'
        );
      }
    }
  });

  it('should throw error for array with invalid tag', () => {
    const invalidTags = [
      [Buffer.from([]), new Map(), Buffer.from([]), null],
      [Buffer.from([]), new Map(), Buffer.from([]), undefined],
      [Buffer.from([]), new Map(), Buffer.from([]), 123],
      [Buffer.from([]), new Map(), Buffer.from([]), 'string'],
      [Buffer.from([]), new Map(), Buffer.from([]), {}],
    ];

    for (const input of invalidTags) {
      try {
        deviceMacSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.'
        );
      }
    }
  });
});
