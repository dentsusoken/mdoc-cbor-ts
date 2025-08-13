import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { keyAuthorizationsSchema } from '../KeyAuthorizations';
import {
  MAP_INVALID_TYPE_MESSAGE_SUFFIX,
  MAP_REQUIRED_MESSAGE_SUFFIX,
} from '@/schemas/common/Map';
import { ARRAY_EMPTY_MESSAGE_SUFFIX } from '@/schemas/common/Array';

describe('KeyAuthorizations', () => {
  describe('valid inputs', () => {
    const cases: Array<{ name: string; input: Map<string, unknown> }> = [
      { name: 'empty map (all fields optional)', input: new Map() },
      {
        name: 'only nameSpaces',
        input: new Map([[`nameSpaces`, ['org.iso.18013.5.1']]]),
      },
      {
        name: 'only dataElements',
        input: new Map([
          ['dataElements', new Map([[`org.iso.18013.5.1`, ['given_name']]])],
        ]),
      },
      {
        name: 'both fields present',
        input: new Map([
          ['nameSpaces', ['org.iso.18013.5.1']],
          [
            'dataElements',
            new Map([[`org.iso.18013.5.1`, ['given_name', 'family_name']]]),
          ],
        ]),
      },
    ];

    cases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = keyAuthorizationsSchema.parse(input);
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });
    });
  });

  describe('invalid container types', () => {
    const prefix = 'KeyAuthorizations: ';
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'string',
        input: 'not-a-map',
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'number',
        input: 123,
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'boolean',
        input: true,
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'null',
        input: null,
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'plain object',
        input: { nameSpaces: [] },
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'array',
        input: [['nameSpaces', []]],
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'set',
        input: new Set([1]),
        expected: `${prefix}${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'undefined',
        input: undefined,
        expected: `${prefix}${MAP_REQUIRED_MESSAGE_SUFFIX}`,
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          keyAuthorizationsSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('invalid field values', () => {
    it('should reject invalid nameSpaces (empty array)', () => {
      try {
        keyAuthorizationsSchema.parse(new Map([[`nameSpaces`, []]]));
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          `AuthorizedNameSpaces: ${ARRAY_EMPTY_MESSAGE_SUFFIX}`
        );
      }
    });

    it('should reject invalid dataElements (not a Map)', () => {
      try {
        keyAuthorizationsSchema.parse(
          new Map([[`dataElements`, { 'org.iso.18013.5.1': ['given_name'] }]])
        );
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'AuthorizedDataElements: Expected a Map with keys and values. Please provide a valid Map.'
        );
      }
    });
  });
});
