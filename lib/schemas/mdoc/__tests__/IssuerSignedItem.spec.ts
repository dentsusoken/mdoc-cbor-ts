import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { issuerSignedItemSchema } from '../IssuerSignedItem';
import { BYTES_INVALID_TYPE_MESSAGE_SUFFIX } from '../../common/Bytes';
import { TEXT_EMPTY_MESSAGE_SUFFIX } from '../../common/Text';

// Constants for expected error messages
const ISSUER_SIGNED_ITEM_INVALID_TYPE_MESSAGE =
  'IssuerSignedItem: Expected an object with fields "digestID", "random", "elementIdentifier", "elementValue". Please provide a valid issuer-signed item object.';
const ISSUER_SIGNED_ITEM_REQUIRED_MESSAGE =
  'IssuerSignedItem: This field is required. Please provide an issuer-signed item object.';

const DIGEST_ID_INVALID_TYPE_MESSAGE =
  'IssuerSignedItem.digestID: Expected a non-negative integer number.';
const DIGEST_ID_REQUIRED_MESSAGE =
  'IssuerSignedItem.digestID: This field is required. Please provide a non-negative integer number.';
const DIGEST_ID_MIN_MESSAGE =
  'IssuerSignedItem.digestID: Must be greater than or equal to 0.';
const DIGEST_ID_INT_MESSAGE =
  'IssuerSignedItem.digestID: Expected an integer number.';

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
        expectedMessage: ISSUER_SIGNED_ITEM_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: ISSUER_SIGNED_ITEM_REQUIRED_MESSAGE,
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: ISSUER_SIGNED_ITEM_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: ISSUER_SIGNED_ITEM_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: ISSUER_SIGNED_ITEM_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: ISSUER_SIGNED_ITEM_INVALID_TYPE_MESSAGE,
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
            DIGEST_ID_INVALID_TYPE_MESSAGE
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
          expect(zodError.issues[0].message).toBe(DIGEST_ID_REQUIRED_MESSAGE);
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
          expect(zodError.issues[0].message).toBe(DIGEST_ID_MIN_MESSAGE);
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
          expect(zodError.issues[0].message).toBe(DIGEST_ID_INT_MESSAGE);
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
            `Bytes: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`
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
            `DataElementIdentifier: ${TEXT_EMPTY_MESSAGE_SUFFIX}`
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
            `DataElementIdentifier: ${TEXT_EMPTY_MESSAGE_SUFFIX}`
          );
        }
      });
    });
  });
});
