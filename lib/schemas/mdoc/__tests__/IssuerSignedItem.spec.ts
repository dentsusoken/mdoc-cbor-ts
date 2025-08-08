import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { issuerSignedItemSchema } from '../IssuerSignedItem';

describe('IssuerSignedItem', () => {
  describe('valid issuer signed items', () => {
    it('should accept string elementValue', () => {
      const item = {
        digestID: 1,
        random: Buffer.from([]),
        elementIdentifier: 'given_name',
        elementValue: 'John',
      };
      const result = issuerSignedItemSchema.parse(item);
      expect(result).toEqual(item);
    });

    it('should accept number elementValue', () => {
      const item = {
        digestID: 2,
        random: Buffer.from([]),
        elementIdentifier: 'age',
        elementValue: 30,
      };
      const result = issuerSignedItemSchema.parse(item);
      expect(result).toEqual(item);
    });

    it('should accept tagged elementValue', () => {
      const item = {
        digestID: 3,
        random: Buffer.from([]),
        elementIdentifier: 'photo',
        elementValue: new Tag(0, 24),
      };
      const result = issuerSignedItemSchema.parse(item);
      expect(result).toEqual(item);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases: Array<{
      name: string;
      input: unknown;
      expectedMessage: string;
    }> = [
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'IssuerSignedItem: Expected an object with fields "digestID", "random", "elementIdentifier", "elementValue". Please provide a valid issuer-signed item object.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'IssuerSignedItem: This field is required. Please provide an issuer-signed item object.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'IssuerSignedItem: Expected an object with fields "digestID", "random", "elementIdentifier", "elementValue". Please provide a valid issuer-signed item object.',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'IssuerSignedItem: Expected an object with fields "digestID", "random", "elementIdentifier", "elementValue". Please provide a valid issuer-signed item object.',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'IssuerSignedItem: Expected an object with fields "digestID", "random", "elementIdentifier", "elementValue". Please provide a valid issuer-signed item object.',
      },
      {
        name: 'array input',
        input: [],
        expectedMessage:
          'IssuerSignedItem: Expected an object with fields "digestID", "random", "elementIdentifier", "elementValue". Please provide a valid issuer-signed item object.',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          issuerSignedItemSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('field validations', () => {
    describe('digestID', () => {
      it('should throw error for non-number digestID', () => {
        try {
          issuerSignedItemSchema.parse({
            digestID: '1' as unknown as number,
            random: Buffer.from([]),
            elementIdentifier: 'given_name',
            elementValue: 'John',
          });
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].path).toEqual(['digestID']);
          expect(zodError.issues[0].message).toBe(
            'IssuerSignedItem.digestID: Expected a non-negative integer number.'
          );
        }
      });

      it('should throw error for missing digestID (undefined)', () => {
        try {
          issuerSignedItemSchema.parse({
            // explicit undefined to trigger field required_error
            digestID: undefined as unknown as number,
            random: Buffer.from([]),
            elementIdentifier: 'given_name',
            elementValue: 'John',
          });
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].path).toEqual(['digestID']);
          expect(zodError.issues[0].message).toBe(
            'IssuerSignedItem.digestID: This field is required. Please provide a non-negative integer number.'
          );
        }
      });

      it('should throw error for negative digestID', () => {
        try {
          issuerSignedItemSchema.parse({
            digestID: -1,
            random: Buffer.from([]),
            elementIdentifier: 'given_name',
            elementValue: 'John',
          });
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].path).toEqual(['digestID']);
          expect(zodError.issues[0].message).toBe(
            'IssuerSignedItem.digestID: Must be greater than or equal to 0.'
          );
        }
      });

      it('should throw error for non-integer digestID', () => {
        try {
          issuerSignedItemSchema.parse({
            digestID: 1.5,
            random: Buffer.from([]),
            elementIdentifier: 'given_name',
            elementValue: 'John',
          });
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].path).toEqual(['digestID']);
          expect(zodError.issues[0].message).toBe(
            'IssuerSignedItem.digestID: Expected an integer number.'
          );
        }
      });
    });

    describe('random', () => {
      it('should throw error for invalid random type', () => {
        try {
          issuerSignedItemSchema.parse({
            digestID: 1,
            random: null,
            elementIdentifier: 'given_name',
            elementValue: 'John',
          });
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].path).toEqual(['random']);
          expect(zodError.issues[0].message).toBe(
            'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.'
          );
        }
      });
    });

    describe('elementIdentifier', () => {
      it('should throw error for empty elementIdentifier', () => {
        try {
          issuerSignedItemSchema.parse({
            digestID: 1,
            random: Buffer.from([]),
            elementIdentifier: '',
            elementValue: 'John',
          });
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].path).toEqual(['elementIdentifier']);
          expect(zodError.issues[0].message).toBe(
            'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")'
          );
        }
      });

      it('should throw error for whitespace-only elementIdentifier', () => {
        try {
          issuerSignedItemSchema.parse({
            digestID: 1,
            random: Buffer.from([]),
            elementIdentifier: '   ',
            elementValue: 'John',
          });
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].path).toEqual(['elementIdentifier']);
          expect(zodError.issues[0].message).toBe(
            'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")'
          );
        }
      });
    });
  });
});
