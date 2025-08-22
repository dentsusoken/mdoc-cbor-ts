import { Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { issuerSignedSchema } from '../IssuerSigned';
import { createTag24 } from '@/cbor/createTag24';
import {
  mapInvalidTypeMessage,
  mapRequiredMessage,
} from '@/schemas/common/Map';
import { z } from 'zod';

describe('IssuerSigned', () => {
  describe('should accept valid inputs', () => {
    it('valid issuer signed data', () => {
      const protectedHeader = new Uint8Array([]);
      const unprotectedHeader = new Map<number, string>([[1, 'value']]);
      const payload = new Uint8Array([]);
      const signature = new Uint8Array([]);

      const validData = new Map<string, unknown>([
        [
          'nameSpaces',
          new Map([
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
          ]),
        ],
        [
          'issuerAuth',
          [protectedHeader, unprotectedHeader, payload, signature],
        ],
      ]);
      const result = issuerSignedSchema.parse(validData);
      expect(result.nameSpaces).toEqual(validData.get('nameSpaces'));
      expect(result.issuerAuth).toEqual(
        new Sign1(protectedHeader, unprotectedHeader, payload, signature)
      );
    });
  });

  describe('should reject invalid inputs', () => {
    const target = 'IssuerSigned';
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
        name: 'object with null nameSpaces and issuerAuth object',
        input: {
          nameSpaces: null,
          issuerAuth: {
            signature: new Uint8Array([1, 2, 3]),
          },
        },
        expected: invalidTypeMsg,
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          issuerSignedSchema.parse(input as never);
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
