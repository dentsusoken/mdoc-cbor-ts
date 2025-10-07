import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { authorizedDataElementsSchema } from '../AuthorizedDataElements';
import { mapInvalidTypeMessage, mapEmptyMessage } from '@/schemas/common/Map';
import { requiredMessage } from '@/schemas/common/Required';
import { arrayEmptyMessage } from '@/schemas/common/Array';
import {
  nonEmptyTextInvalidTypeMessage,
  nonEmptyTextEmptyMessage,
} from '@/schemas/common/NonEmptyText';

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
        expected: mapInvalidTypeMessage(TARGET),
      },
      {
        name: 'null input',
        input: null,
        expected: requiredMessage(TARGET),
      },
      {
        name: 'plain object input',
        input: {},
        expected: mapInvalidTypeMessage(TARGET),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMessage(TARGET),
      },
      // content validations
      {
        name: 'empty map',
        input: new Map(),
        expected: mapEmptyMessage(TARGET),
      },
      {
        name: 'invalid namespace key type',
        input: new Map([[123 as unknown as string, ['given_name']]]),
        expected: nonEmptyTextInvalidTypeMessage('NameSpace'),
      },
      {
        name: 'empty elements array',
        input: new Map([[`org.iso.18013.5.1`, []]]),
        expected: arrayEmptyMessage('DataElementIdentifiers'),
      },
      {
        name: 'invalid element type inside array',
        input: new Map([[`org.iso.18013.5.1`, [123 as unknown as string]]]),
        expected: nonEmptyTextInvalidTypeMessage('DataElementIdentifier'),
      },
      {
        name: 'empty string element identifier',
        input: new Map([[`org.iso.18013.5.1`, ['']]]),
        expected: nonEmptyTextEmptyMessage('DataElementIdentifier'),
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
