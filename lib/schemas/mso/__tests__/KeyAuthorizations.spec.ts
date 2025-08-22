import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { keyAuthorizationsSchema } from '../KeyAuthorizations';
import {
  mapInvalidTypeMessage,
  mapRequiredMessage,
} from '@/schemas/common/Map';

describe('KeyAuthorizations', () => {
  describe('valid inputs', () => {
    const cases: Array<{
      name: string;
      input: Map<string, unknown>;
      expected: Record<string, unknown>;
    }> = [
      {
        name: 'empty map (all fields optional)',
        input: new Map(),
        expected: {},
      },
      {
        name: 'only nameSpaces',
        input: new Map([[`nameSpaces`, ['org.iso.18013.5.1']]]),
        expected: { nameSpaces: ['org.iso.18013.5.1'] },
      },
      {
        name: 'only dataElements',
        input: new Map([
          ['dataElements', new Map([[`org.iso.18013.5.1`, ['given_name']]])],
        ]),
        expected: {
          dataElements: new Map([[`org.iso.18013.5.1`, ['given_name']]]),
        },
      },
      {
        name: 'both fields present',
        input: new Map<string, unknown>([
          ['nameSpaces', ['org.iso.18013.5.1']],
          [
            'dataElements',
            new Map([[`org.iso.18013.5.1`, ['given_name', 'family_name']]]),
          ],
        ]),
        expected: {
          nameSpaces: ['org.iso.18013.5.1'],
          dataElements: new Map([
            [`org.iso.18013.5.1`, ['given_name', 'family_name']],
          ]),
        },
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should accept ${name}`, () => {
        const result = keyAuthorizationsSchema.parse(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('invalid container types', () => {
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'string',
        input: 'not-a-map',
        expected: mapInvalidTypeMessage('KeyAuthorizations'),
      },
      {
        name: 'number',
        input: 123,
        expected: mapInvalidTypeMessage('KeyAuthorizations'),
      },
      {
        name: 'boolean',
        input: true,
        expected: mapInvalidTypeMessage('KeyAuthorizations'),
      },
      {
        name: 'null',
        input: null,
        expected: mapInvalidTypeMessage('KeyAuthorizations'),
      },
      {
        name: 'plain object',
        input: { nameSpaces: [] },
        expected: mapInvalidTypeMessage('KeyAuthorizations'),
      },
      {
        name: 'array',
        input: [['nameSpaces', []]],
        expected: mapInvalidTypeMessage('KeyAuthorizations'),
      },
      {
        name: 'set',
        input: new Set([1]),
        expected: mapInvalidTypeMessage('KeyAuthorizations'),
      },
      {
        name: 'undefined',
        input: undefined,
        expected: mapRequiredMessage('KeyAuthorizations'),
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
});
