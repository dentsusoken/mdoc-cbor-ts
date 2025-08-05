import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceSignedItemsSchema } from '../DeviceSignedItems';

describe('DeviceSignedItems', () => {
  it('should accept valid device signed items', () => {
    const validItems = [
      {
        given_name: 'John',
        family_name: 'Doe',
      },
      {
        age: 30,
        height: 180.5,
      },
      {
        photo: new Tag(24, 0),
        signature: new Tag(24, 123),
      },
    ];

    validItems.forEach((items) => {
      expect(() => deviceSignedItemsSchema.parse(items)).not.toThrow();
      const result = deviceSignedItemsSchema.parse(items);
      expect(result).toEqual(items);
    });
  });

  it('should throw error for null input', () => {
    try {
      deviceSignedItemsSchema.parse(null);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe('Expected object, received null');
    }
  });

  it('should throw error for undefined input', () => {
    try {
      deviceSignedItemsSchema.parse(undefined);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe('Required');
    }
  });

  it('should throw error for boolean input', () => {
    try {
      deviceSignedItemsSchema.parse(true);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Expected object, received boolean'
      );
    }
  });

  it('should throw error for number input', () => {
    try {
      deviceSignedItemsSchema.parse(123);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Expected object, received number'
      );
    }
  });

  it('should throw error for string input', () => {
    try {
      deviceSignedItemsSchema.parse('string');
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Expected object, received string'
      );
    }
  });

  it('should throw error for array input', () => {
    try {
      deviceSignedItemsSchema.parse([]);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'Expected object, received array'
      );
    }
  });

  it('should throw error for empty object', () => {
    const emptyObject = {};

    try {
      deviceSignedItemsSchema.parse(emptyObject);
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DeviceSignedItems: At least one data element must be provided. The object cannot be empty.'
      );
    }
  });

  it('should throw error for object with invalid keys', () => {
    const invalidKeysObject = {
      123: 'value', // number key
      '': 'value', // empty string key
    };

    try {
      deviceSignedItemsSchema.parse(invalidKeysObject);
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")'
      );
    }
  });

  it('should throw error for object with whitespace-only keys', () => {
    const whitespaceKeysObject = {
      '   ': 'value', // whitespace-only key
    };

    expect(() => deviceSignedItemsSchema.parse(whitespaceKeysObject)).toThrow();

    try {
      deviceSignedItemsSchema.parse(whitespaceKeysObject);
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toBe(
        'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")'
      );
    }
  });
});
