import { describe, expect, it } from 'vitest';
import { issuerNameSpacesSchema } from '../IssuerNameSpaces';
import { createTag24 } from '@/cbor/createTag24';
import { Tag } from 'cbor-x';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerEmptyMessage } from '@/schemas/messages/containerEmptyMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';
import {
  embeddedCborInvalidTagMessage,
  embeddedCborInvalidValueMessage,
} from '@/schemas/cbor/EmbeddedCbor';
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
    const TARGET = 'IssuerNameSpaces';

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

    it('should reject empty map with containerEmptyMessage', () => {
      try {
        issuerNameSpacesSchema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(containerEmptyMessage(TARGET));
      }
    });

    it('should reject value array being empty', () => {
      const input = new Map<string, unknown>([['org.iso.18013.5.1', []]]);
      try {
        issuerNameSpacesSchema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual([0, 'value']);
        expect(issue.message).toBe(
          containerInvalidValueMessage({
            target: TARGET,
            path: issue.path,
            originalMessage: containerEmptyMessage(
              'IssuerSignedItemBytesArray'
            ),
          })
        );
      }
    });

    it('should reject non-Tag item with exact wrapped message', () => {
      const input = new Map<string, unknown>([['org.iso.18013.5.1', [42]]]);
      try {
        issuerNameSpacesSchema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual([0, 'value', 0]);
        // embeddedCborSchema expects Tag(24); 42 is number, so Zod will report instance check failed.
        // The EmbeddedCbor schema uses z.instanceof(Tag), which yields default Zod message.
        // We cannot easily generate that message here deterministically, so we assert the container wrapper and path.
        expect(issue.message).toBe(
          containerInvalidValueMessage({
            target: TARGET,
            path: issue.path,
            originalMessage: 'Input not instance of Tag',
          })
        );
      }
    });

    it('should reject wrong tag number with exact wrapped message', () => {
      const wrongTag = new Tag(new Uint8Array([1]), 99);
      const input = new Map<string, unknown>([
        ['org.iso.18013.5.1', [wrongTag]],
      ]);
      try {
        issuerNameSpacesSchema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual([0, 'value', 0]);
        expect(issue.message).toBe(
          containerInvalidValueMessage({
            target: TARGET,
            path: issue.path,
            originalMessage: embeddedCborInvalidTagMessage(99),
          })
        );
      }
    });

    it('should reject non-Uint8Array tag value with exact wrapped message', () => {
      const badValueTag = new Tag('not-bytes', 24);
      const input = new Map<string, unknown>([
        ['org.iso.18013.5.1', [badValueTag]],
      ]);
      try {
        issuerNameSpacesSchema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual([0, 'value', 0]);
        expect(issue.message).toBe(
          containerInvalidValueMessage({
            target: TARGET,
            path: issue.path,
            originalMessage: embeddedCborInvalidValueMessage('not-bytes'),
          })
        );
      }
    });
  });
});
