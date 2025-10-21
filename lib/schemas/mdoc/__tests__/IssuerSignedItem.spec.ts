import { describe, expect, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import {
  issuerSignedItemSchema,
  createIssuerSignedItem,
} from '../IssuerSignedItem';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { valueInvalidTypeMessage } from '@/schemas/messages';
import { getTypeName } from '@/utils/getTypeName';

describe('IssuerSignedItem', () => {
  describe('createIssuerSignedItem', () => {
    it('should create a valid IssuerSignedItem Map with string elementValue', () => {
      const item = createIssuerSignedItem([
        ['digestID', 1],
        ['random', Uint8Array.from([])],
        ['elementIdentifier', 'given_name'],
        ['elementValue', 'John'],
      ]);

      expect(item).toBeInstanceOf(Map);
      expect(item.get('digestID')).toBe(1);
      expect(item.get('random')).toEqual(Uint8Array.from([]));
      expect(item.get('elementIdentifier')).toBe('given_name');
      expect(item.get('elementValue')).toBe('John');

      // Test type safety of get method
      expectTypeOf(item.get('digestID')).toEqualTypeOf<number | undefined>();
      expectTypeOf(item.get('random')).toEqualTypeOf<Uint8Array | undefined>();
      expectTypeOf(item.get('elementIdentifier')).toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf(item.get('elementValue')).toEqualTypeOf<unknown>();
    });

    it('should create a valid IssuerSignedItem Map with number elementValue', () => {
      const item = createIssuerSignedItem([
        ['digestID', 2],
        ['random', Uint8Array.from([1, 2, 3])],
        ['elementIdentifier', 'age'],
        ['elementValue', 30],
      ]);

      expect(item).toBeInstanceOf(Map);
      expect(item.get('digestID')).toBe(2);
      expect(item.get('random')).toEqual(Uint8Array.from([1, 2, 3]));
      expect(item.get('elementIdentifier')).toBe('age');
      expect(item.get('elementValue')).toBe(30);

      // Test type safety of get method
      expectTypeOf(item.get('digestID')).toEqualTypeOf<number | undefined>();
      expectTypeOf(item.get('random')).toEqualTypeOf<Uint8Array | undefined>();
      expectTypeOf(item.get('elementIdentifier')).toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf(item.get('elementValue')).toEqualTypeOf<unknown>();
    });
  });

  describe('issuerSignedItemSchema', () => {
    it('should accept string elementValue', () => {
      const item = new Map<string, unknown>([
        ['digestID', 1],
        ['random', Uint8Array.from([])],
        ['elementIdentifier', 'given_name'],
        ['elementValue', 'John'],
      ]);
      const result = issuerSignedItemSchema.parse(item);
      expect(result).toEqual(item);

      // Test type safety of get method
      expectTypeOf(result.get('digestID')).toEqualTypeOf<number | undefined>();
      expectTypeOf(result.get('random')).toEqualTypeOf<
        Uint8Array | undefined
      >();
      expectTypeOf(result.get('elementIdentifier')).toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf(result.get('elementValue')).toEqualTypeOf<unknown>();
    });

    it('should accept number elementValue', () => {
      const item = new Map<string, unknown>([
        ['digestID', 2],
        ['random', Uint8Array.from([])],
        ['elementIdentifier', 'age'],
        ['elementValue', 30],
      ]);
      const result = issuerSignedItemSchema.parse(item);
      expect(result).toEqual(item);

      // Test type safety of get method
      expectTypeOf(result.get('digestID')).toEqualTypeOf<number | undefined>();
      expectTypeOf(result.get('random')).toEqualTypeOf<
        Uint8Array | undefined
      >();
      expectTypeOf(result.get('elementIdentifier')).toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf(result.get('elementValue')).toEqualTypeOf<unknown>();
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
        expectedMessage: containerInvalidTypeMessage({
          target: 'IssuerSignedItem',
          expected: 'Map',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: containerInvalidTypeMessage({
          target: 'IssuerSignedItem',
          expected: 'Map',
          received: getTypeName(undefined),
        }),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: containerInvalidTypeMessage({
          target: 'IssuerSignedItem',
          expected: 'Map',
          received: getTypeName(true),
        }),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: containerInvalidTypeMessage({
          target: 'IssuerSignedItem',
          expected: 'Map',
          received: getTypeName(123),
        }),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: containerInvalidTypeMessage({
          target: 'IssuerSignedItem',
          expected: 'Map',
          received: getTypeName('string'),
        }),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: containerInvalidTypeMessage({
          target: 'IssuerSignedItem',
          expected: 'Map',
          received: getTypeName([]),
        }),
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
            containerInvalidValueMessage({
              target: 'IssuerSignedItem',
              path: ['digestID'],
              originalMessage: 'Expected number, received string',
            })
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
          const original = valueInvalidTypeMessage({
            expected: 'Uint8Array or Buffer',
            received: getTypeName(null),
          });
          expect(zodError.issues[0].message).toBe(
            containerInvalidValueMessage({
              target: 'IssuerSignedItem',
              path: ['random'],
              originalMessage: original,
            })
          );
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
            containerInvalidValueMessage({
              target: 'IssuerSignedItem',
              path: ['elementIdentifier'],
              originalMessage: 'String must contain at least 1 character(s)',
            })
          );
        }
      });
    });
  });
});
