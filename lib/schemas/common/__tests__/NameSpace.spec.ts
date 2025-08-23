import { describe, expect, it } from 'vitest';
import { nameSpaceSchema } from '../NameSpace';
import {
  nonEmptyTextInvalidTypeMessage,
  nonEmptyTextEmptyMessage,
} from '../NonEmptyText';
import { z } from 'zod';
import { requiredMessage } from '../Required';

describe('NameSpace', () => {
  describe('should accept valid string namespaces', () => {
    const testCases = [
      {
        name: 'ISO standard namespace',
        input: 'org.iso.18013.5.1',
      },
      {
        name: 'custom namespace with dots',
        input: 'com.example.namespace',
      },
      {
        name: 'simple test namespace',
        input: 'test.namespace',
      },
      {
        name: 'multi-level namespace',
        input: 'a.b.c',
      },
      {
        name: 'single word namespace',
        input: 'namespace',
      },
      {
        name: 'namespace with numbers',
        input: 'org.example.123.456',
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = nameSpaceSchema.parse(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const testCases = [
      {
        name: 'number input',
        input: 123,
        expectedMessage: nonEmptyTextInvalidTypeMessage('NameSpace'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: nonEmptyTextInvalidTypeMessage('NameSpace'),
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage: nonEmptyTextInvalidTypeMessage('NameSpace'),
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage: nonEmptyTextInvalidTypeMessage('NameSpace'),
      },
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('NameSpace'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('NameSpace'),
      },
      {
        name: 'empty string',
        input: '',
        expectedMessage: nonEmptyTextEmptyMessage('NameSpace'),
      },
      {
        name: 'whitespace-only string',
        input: '   ',
        expectedMessage: nonEmptyTextEmptyMessage('NameSpace'),
      },
      {
        name: 'string with only tabs',
        input: '\t\t\t',
        expectedMessage: nonEmptyTextEmptyMessage('NameSpace'),
      },
      {
        name: 'string with only newlines',
        input: '\n\n\n',
        expectedMessage: nonEmptyTextEmptyMessage('NameSpace'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          nameSpaceSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });
});
