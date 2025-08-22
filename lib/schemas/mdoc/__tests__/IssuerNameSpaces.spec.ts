import { describe, expect, it } from 'vitest';
import { issuerNameSpacesSchema } from '../IssuerNameSpaces';
import { createTag24 } from '@/cbor/createTag24';
import {
  mapInvalidTypeMessage,
  mapRequiredMessage,
} from '@/schemas/common/Map';
import { z } from 'zod';

describe('IssuerNameSpaces', () => {
  describe('should accept valid inputs', () => {
    it('single namespace with one IssuerSignedItemBytes', () => {
      const validInput = new Map([
        [
          'org.iso.18013.5.1',
          [
            createTag24(
              new Map<string, unknown>([
                ['digestID', 1],
                ['random', new Uint8Array([])],
                ['elementIdentifier', 'given_name'],
                ['elementValue', 'John'],
              ])
            ),
          ],
        ],
      ]);

      const result = issuerNameSpacesSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });
  });

  describe('should reject invalid inputs', () => {
    const target = 'IssuerNameSpaces';
    const invalidTypeMsg = mapInvalidTypeMessage(target);
    const requiredMsg = mapRequiredMessage(target);

    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      { name: 'null input', input: null, expected: invalidTypeMsg },
      { name: 'undefined input', input: undefined, expected: requiredMsg },
      { name: 'boolean input', input: true, expected: invalidTypeMsg },
      { name: 'number input', input: 123, expected: invalidTypeMsg },
      { name: 'string input', input: 'string', expected: invalidTypeMsg },
      { name: 'array input', input: [], expected: invalidTypeMsg },
      { name: 'plain object input', input: {}, expected: invalidTypeMsg },
      {
        name: 'object with array value',
        input: { 'org.iso.18013.5.1': [] },
        expected: invalidTypeMsg,
      },
      {
        name: 'object with null value',
        input: { 'org.iso.18013.5.1': null },
        expected: invalidTypeMsg,
      },
      {
        name: 'object with undefined value',
        input: { 'org.iso.18013.5.1': undefined },
        expected: invalidTypeMsg,
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should throw error for ${name}`, () => {
        try {
          issuerNameSpacesSchema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
