import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  KeyAuthorizations,
  keyAuthorizationsSchema,
} from '../KeyAuthorizations';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('KeyAuthorizations', () => {
  describe('valid inputs', () => {
    const cases: Array<{
      name: string;
      input: Map<string, unknown>;
      expected: KeyAuthorizations;
    }> = [
      {
        name: 'empty map (all fields optional)',
        input: new Map(),
        expected: new Map(),
      },
      {
        name: 'only nameSpaces',
        input: new Map([[`nameSpaces`, ['org.iso.18013.5.1']]]),
        expected: new Map([[`nameSpaces`, ['org.iso.18013.5.1']]]),
      },
      {
        name: 'only dataElements',
        input: new Map([
          ['dataElements', new Map([[`org.iso.18013.5.1`, ['given_name']]])],
        ]),
        expected: new Map([
          ['dataElements', new Map([[`org.iso.18013.5.1`, ['given_name']]])],
        ]),
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
        expected: new Map<string, unknown>([
          ['nameSpaces', ['org.iso.18013.5.1']],
          [
            'dataElements',
            new Map([[`org.iso.18013.5.1`, ['given_name', 'family_name']]]),
          ],
        ]),
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
    const expectedMessage = (v: unknown): string =>
      containerInvalidTypeMessage({
        target: 'KeyAuthorizations',
        expected: 'Map',
        received: getTypeName(v),
      });

    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'string',
        input: 'not-a-map',
        expected: expectedMessage('not-a-map'),
      },
      { name: 'number', input: 123, expected: expectedMessage(123) },
      { name: 'boolean', input: true, expected: expectedMessage(true) },
      { name: 'null', input: null, expected: expectedMessage(null) },
      {
        name: 'plain object',
        input: { nameSpaces: [] },
        expected: expectedMessage({ nameSpaces: [] }),
      },
      {
        name: 'array',
        input: [['nameSpaces', []]],
        expected: expectedMessage([['nameSpaces', []]]),
      },
      {
        name: 'set',
        input: new Set([1]),
        expected: expectedMessage(new Set([1])),
      },
      {
        name: 'undefined',
        input: undefined,
        expected: expectedMessage(undefined),
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
