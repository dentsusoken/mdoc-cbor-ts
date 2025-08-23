import { Tag } from 'cbor-x';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { issuerSignedItemSchema } from '../IssuerSignedItem';
import { requiredMessage } from '@/schemas/common/Required';
import { nonEmptyTextEmptyMessage } from '@/schemas/common/NonEmptyText';
import { uintInvalidTypeMessage } from '@/schemas/common/Uint';
import { mapInvalidTypeMessage } from '@/schemas/common/Map';

describe('IssuerSignedItem', () => {
  describe('valid issuer signed items', () => {
    it('should accept string elementValue', () => {
      const item = new Map<string, unknown>([
        ['digestID', 1],
        ['random', Uint8Array.from([])],
        ['elementIdentifier', 'given_name'],
        ['elementValue', 'John'],
      ]);
      const result = issuerSignedItemSchema.parse(item);
      expect(result).toEqual(Object.fromEntries(item));
    });

    it('should accept number elementValue', () => {
      const item = new Map<string, unknown>([
        ['digestID', 2],
        ['random', Uint8Array.from([])],
        ['elementIdentifier', 'age'],
        ['elementValue', 30],
      ]);
      const result = issuerSignedItemSchema.parse(item);
      expect(result).toEqual(Object.fromEntries(item));
    });

    it('should accept tagged elementValue', () => {
      const item = new Map<string, unknown>([
        ['digestID', 3],
        ['random', Uint8Array.from([])],
        ['elementIdentifier', 'photo'],
        ['elementValue', new Tag(0, 24)],
      ]);
      const result = issuerSignedItemSchema.parse(item);
      expect(result).toEqual(Object.fromEntries(item));
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
        expectedMessage: requiredMessage('IssuerSignedItem'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('IssuerSignedItem'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: mapInvalidTypeMessage('IssuerSignedItem'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: mapInvalidTypeMessage('IssuerSignedItem'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: mapInvalidTypeMessage('IssuerSignedItem'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: mapInvalidTypeMessage('IssuerSignedItem'),
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
          issuerSignedItemSchema.parse(
            new Map<string, unknown>([
              ['digestID', '1' as unknown as number],
              ['random', Uint8Array.from([])],
              ['elementIdentifier', 'given_name'],
              ['elementValue', 'John'],
            ])
          );
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].path).toEqual(['digestID']);
          expect(zodError.issues[0].message).toBe(
            uintInvalidTypeMessage('DigestID')
          );
        }
      });
    });

    describe('random', () => {
      it('should throw required error for null random', () => {
        try {
          issuerSignedItemSchema.parse(
            new Map<string, unknown>([
              ['digestID', 1],
              ['random', null],
              ['elementIdentifier', 'given_name'],
              ['elementValue', 'John'],
            ])
          );
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].path).toEqual(['random']);
          expect(zodError.issues[0].message).toBe(requiredMessage('random'));
        }
      });
    });

    describe('elementIdentifier', () => {
      it('should throw error for empty elementIdentifier', () => {
        try {
          issuerSignedItemSchema.parse(
            new Map<string, unknown>([
              ['digestID', 1],
              ['random', Uint8Array.from([])],
              ['elementIdentifier', ''],
              ['elementValue', 'John'],
            ])
          );
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].path).toEqual(['elementIdentifier']);
          expect(zodError.issues[0].message).toBe(
            nonEmptyTextEmptyMessage('DataElementIdentifier')
          );
        }
      });
    });
  });
});
