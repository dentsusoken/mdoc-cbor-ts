import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { authorizedDataElementsSchema } from '../AuthorizedDataElements';
import {
  MAP_INVALID_TYPE_MESSAGE_SUFFIX,
  MAP_REQUIRED_MESSAGE_SUFFIX,
  MAP_EMPTY_MESSAGE_SUFFIX,
} from '@/schemas/common/Map';
import { ARRAY_EMPTY_MESSAGE_SUFFIX } from '@/schemas/common/Array';
import {
  TEXT_INVALID_TYPE_MESSAGE_SUFFIX,
  TEXT_EMPTY_MESSAGE_SUFFIX,
} from '@/schemas/common/NonEmptyText';

describe('AuthorizedDataElements', () => {
  const TARGET = 'AuthorizedDataElements';
  const PREFIX = `${TARGET}: `;

  describe('valid inputs', () => {
    const cases: Array<{ name: string; input: Map<string, string[]> }> = [
      {
        name: 'single namespace with single element',
        input: new Map([[`org.iso.18013.5.1`, ['given_name']]]),
      },
      {
        name: 'single namespace with multiple elements',
        input: new Map([[`org.iso.18013.5.1`, ['given_name', 'family_name']]]),
      },
      {
        name: 'multiple namespaces',
        input: new Map([
          ['org.iso.18013.5.1', ['given_name']],
          ['com.example', ['field1', 'field2']],
        ]),
      },
    ];

    cases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = authorizedDataElementsSchema.parse(input);
        expect(result).toBeInstanceOf(Map);
        expect(result).toEqual(input);
      });
    });
  });

  describe('invalid types', () => {
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'boolean input',
        input: true,
        expected: `${PREFIX}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'null input',
        input: null,
        expected: `${PREFIX}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'plain object input',
        input: {},
        expected: `${PREFIX}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: `${PREFIX}${MAP_REQUIRED_MESSAGE_SUFFIX}`,
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          authorizedDataElementsSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('content validation', () => {
    it('should reject empty map', () => {
      try {
        authorizedDataElementsSchema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          `${PREFIX}${MAP_EMPTY_MESSAGE_SUFFIX}`
        );
      }
    });

    it('should reject invalid namespace key type', () => {
      try {
        authorizedDataElementsSchema.parse(new Map([[123, ['given_name']]]));
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          `NameSpace: ${TEXT_INVALID_TYPE_MESSAGE_SUFFIX}`
        );
      }
    });

    it('should reject empty elements array', () => {
      try {
        authorizedDataElementsSchema.parse(
          new Map([[`org.iso.18013.5.1`, []]])
        );
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          `DataElementsArray: ${ARRAY_EMPTY_MESSAGE_SUFFIX}`
        );
      }
    });

    it('should reject invalid element type inside array', () => {
      try {
        authorizedDataElementsSchema.parse(
          new Map([['org.iso.18013.5.1', [123]]])
        );
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          `DataElementIdentifier: ${TEXT_INVALID_TYPE_MESSAGE_SUFFIX}`
        );
      }
    });

    it('should reject empty string element identifier', () => {
      try {
        authorizedDataElementsSchema.parse(
          new Map([[`org.iso.18013.5.1`, ['']]])
        );
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          `DataElementIdentifier: ${TEXT_EMPTY_MESSAGE_SUFFIX}`
        );
      }
    });
  });
});
