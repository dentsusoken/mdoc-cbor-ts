import { Tag } from 'cbor-x';
import { describe, expect, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import {
  issuerSignedItemSchema,
  createIssuerSignedItem,
} from '../IssuerSignedItem';
import {
  strictMapNotMapMessage,
  strictMapKeyValueMessage,
} from '@/schemas/common/container/StrictMap';
import { requiredMessage } from '@/schemas/common/Required';
import { nonEmptyTextEmptyMessage } from '@/schemas/common/NonEmptyText';
import { uintInvalidTypeMessage } from '@/schemas/common/Uint';

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

    it('should create a valid IssuerSignedItem Map with tagged elementValue', () => {
      const item = createIssuerSignedItem([
        ['digestID', 3],
        ['random', Uint8Array.from([4, 5, 6])],
        ['elementIdentifier', 'photo'],
        ['elementValue', new Tag(0, 24)],
      ]);

      expect(item).toBeInstanceOf(Map);
      expect(item.get('digestID')).toBe(3);
      expect(item.get('random')).toEqual(Uint8Array.from([4, 5, 6]));
      expect(item.get('elementIdentifier')).toBe('photo');
      expect(item.get('elementValue')).toEqual(new Tag(0, 24));

      // Test type safety of get method
      expectTypeOf(item.get('digestID')).toEqualTypeOf<number | undefined>();
      expectTypeOf(item.get('random')).toEqualTypeOf<Uint8Array | undefined>();
      expectTypeOf(item.get('elementIdentifier')).toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf(item.get('elementValue')).toEqualTypeOf<unknown>();
    });

    it('should be compatible with issuerSignedItemSchema validation', () => {
      const item = createIssuerSignedItem([
        ['digestID', 1],
        ['random', Uint8Array.from([])],
        ['elementIdentifier', 'given_name'],
        ['elementValue', 'John'],
      ]);

      // Should not throw when parsing with schema
      expect(() => issuerSignedItemSchema.parse(item)).not.toThrow();

      const result = issuerSignedItemSchema.parse(item);
      expect(result).toEqual(item);
    });
  });

  describe('valid issuer signed items', () => {
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

    it('should accept tagged elementValue', () => {
      const item = new Map<string, unknown>([
        ['digestID', 3],
        ['random', Uint8Array.from([])],
        ['elementIdentifier', 'photo'],
        ['elementValue', new Tag(0, 24)],
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
        expectedMessage: strictMapNotMapMessage('IssuerSignedItem', 'object'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: strictMapNotMapMessage(
          'IssuerSignedItem',
          'undefined'
        ),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: strictMapNotMapMessage('IssuerSignedItem', 'boolean'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: strictMapNotMapMessage('IssuerSignedItem', 'number'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: strictMapNotMapMessage('IssuerSignedItem', 'string'),
      },
      {
        name: 'array input',
        input: [],
        expectedMessage: strictMapNotMapMessage('IssuerSignedItem', 'Array'),
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
            strictMapKeyValueMessage(
              'IssuerSignedItem',
              ['digestID'],
              uintInvalidTypeMessage('DigestID')
            )
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
          expect(zodError.issues[0].message).toBe(
            strictMapKeyValueMessage(
              'IssuerSignedItem',
              ['random'],
              requiredMessage('random')
            )
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
            strictMapKeyValueMessage(
              'IssuerSignedItem',
              ['elementIdentifier'],
              nonEmptyTextEmptyMessage('DataElementIdentifier')
            )
          );
        }
      });
    });
  });
});
