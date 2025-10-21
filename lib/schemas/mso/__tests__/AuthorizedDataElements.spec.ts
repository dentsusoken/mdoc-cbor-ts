import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { authorizedDataElementsSchema } from '../AuthorizedDataElements';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerEmptyMessage } from '@/schemas/messages/containerEmptyMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('AuthorizedDataElements', () => {
  const TARGET = 'AuthorizedDataElements';

  describe('success cases', () => {
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

  describe('error cases', () => {
    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      // invalid types for the map itself
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
        name: 'null input',
        input: null,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(null),
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
        name: 'undefined input',
        input: undefined,
        expected: containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(undefined),
        }),
      },
      // content validations
      {
        name: 'empty map',
        input: new Map(),
        expected: containerEmptyMessage(TARGET),
      },
      {
        name: 'invalid namespace key type',
        input: new Map([[123 as unknown as string, ['given_name']]]),
        expected: containerInvalidValueMessage({
          target: TARGET,
          path: [0, 'key'],
          originalMessage: 'Expected string, received number',
        }),
      },
      {
        name: 'invalid element type inside array',
        input: new Map([[`org.iso.18013.5.1`, [123 as unknown as string]]]),
        expected: containerInvalidValueMessage({
          target: TARGET,
          path: [0, 'value', 0],
          originalMessage: 'Expected string, received number',
        }),
      },
      {
        name: 'empty elements array',
        input: new Map([[`org.iso.18013.5.1`, []]]),
        expected: containerInvalidValueMessage({
          target: TARGET,
          path: [0, 'value'],
          originalMessage: containerEmptyMessage('DataElementIdentifiers'),
        }),
      },
      {
        name: 'empty string element identifier',
        input: new Map([[`org.iso.18013.5.1`, ['']]]),
        expected: containerInvalidValueMessage({
          target: TARGET,
          path: [0, 'value', 0],
          originalMessage: 'String must contain at least 1 character(s)',
        }),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          authorizedDataElementsSchema.parse(input as never);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
