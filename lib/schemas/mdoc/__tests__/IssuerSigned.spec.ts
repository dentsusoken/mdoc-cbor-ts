//
import { describe, expect, it } from 'vitest';
import { issuerSignedSchema, createIssuerSigned } from '../IssuerSigned';
import { createTag24 } from '@/cbor/createTag24';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';
import { z } from 'zod';
import { createTag18 } from '@/cbor/createTag18';
import { Tag } from 'cbor-x';

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
          createTag18([protectedHeader, unprotectedHeader, payload, signature]),
        ],
      ]);
      const result = issuerSignedSchema.parse(validData);
      expect(result).toEqual(validData);
    });
  });

  describe('createIssuerSigned', () => {
    it('should construct a valid IssuerSigned map', () => {
      const protectedHeader = new Uint8Array([]);
      const unprotectedHeader = new Map<number, string>([[1, 'value']]);
      const payload = new Uint8Array([]);
      const signature = new Uint8Array([]);

      const created = createIssuerSigned([
        [
          'nameSpaces',
          new Map<string, Tag[]>([
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
          createTag18([protectedHeader, unprotectedHeader, payload, signature]),
        ],
      ]);

      const parsed = issuerSignedSchema.parse(created);
      expect(parsed).toEqual(created);
    });
  });

  describe('should reject invalid inputs', () => {
    const TARGET = 'IssuerSigned';

    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'null input',
        input: null,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(undefined),
        }),
      },
      {
        name: 'boolean input',
        input: true,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(true),
        }),
      },
      {
        name: 'number input',
        input: 123,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(123),
        }),
      },
      {
        name: 'string input',
        input: 'string',
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName('string'),
        }),
      },
      {
        name: 'array input',
        input: [],
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName([]),
        }),
      },
      {
        name: 'plain object input',
        input: {},
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName({}),
        }),
      },
      {
        name: 'object with null nameSpaces and issuerAuth object',
        input: {
          nameSpaces: null,
          issuerAuth: {
            signature: new Uint8Array([1, 2, 3]),
          },
        },
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName({
            nameSpaces: null,
            issuerAuth: { signature: new Uint8Array([1, 2, 3]) },
          }),
        }),
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

  describe('nested schema errors', () => {
    it('should wrap IssuerNameSpaces invalid type with containerInvalidValueMessage', () => {
      const protectedHeader = new Uint8Array([]);
      const unprotectedHeader = new Map<number, string>([[1, 'value']]);
      const payload = new Uint8Array([]);
      const signature = new Uint8Array([]);

      const invalid = new Map<string, unknown>([
        ['nameSpaces', 'not-a-map'],
        [
          'issuerAuth',
          createTag18([protectedHeader, unprotectedHeader, payload, signature]),
        ],
      ]);

      try {
        issuerSignedSchema.parse(invalid);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual(['nameSpaces']);
        const expectedInner = containerInvalidTypeMessage({
          target: 'IssuerNameSpaces',
          expected: 'Map',
          received: getTypeName('not-a-map'),
        });
        const expected = containerInvalidValueMessage({
          target: 'IssuerSigned',
          path: issue.path,
          originalMessage: expectedInner,
        });
        expect(issue.message).toBe(expected);
      }
    });

    it('should wrap IssuerAuth wrong tag with containerInvalidValueMessage', () => {
      const protectedHeader = new Uint8Array([]);
      const unprotectedHeader = new Map<number, string>([[1, 'value']]);
      const payload = new Uint8Array([]);
      const signature = new Uint8Array([]);

      const wrongTag = new Tag(
        [protectedHeader, unprotectedHeader, payload, signature],
        99
      );

      const invalid = new Map<string, unknown>([
        [
          'nameSpaces',
          new Map<string, unknown>([
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
        ['issuerAuth', wrongTag],
      ]);

      try {
        issuerSignedSchema.parse(invalid);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual(['issuerAuth']);
        const expectedInner = containerInvalidTypeMessage({
          target: 'IssuerAuth',
          expected: 'Tag(18)',
          received: 'Tag(99)',
        });
        const expected = containerInvalidValueMessage({
          target: 'IssuerSigned',
          path: issue.path,
          originalMessage: expectedInner,
        });
        expect(issue.message).toBe(expected);
      }
    });
  });
});
