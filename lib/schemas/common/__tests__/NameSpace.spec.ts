import { describe, expect, it } from 'vitest';
import { nameSpaceSchema } from '../NameSpace';
import {
  TEXT_INVALID_TYPE_MESSAGE_SUFFIX,
  TEXT_REQUIRED_MESSAGE_SUFFIX,
  TEXT_EMPTY_MESSAGE_SUFFIX,
} from '../NonEmptyText';
import { z } from 'zod';

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
    const prefix = 'NameSpace: ';
    const testCases = [
      {
        name: 'number input',
        input: 123,
        expectedMessage: `${prefix}${TEXT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: `${prefix}${TEXT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage: `${prefix}${TEXT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage: `${prefix}${TEXT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'null input',
        input: null,
        expectedMessage: `${prefix}${TEXT_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: `${prefix}${TEXT_REQUIRED_MESSAGE_SUFFIX}`,
      },
      {
        name: 'empty string',
        input: '',
        expectedMessage: `${prefix}${TEXT_EMPTY_MESSAGE_SUFFIX}`,
      },
      {
        name: 'whitespace-only string',
        input: '   ',
        expectedMessage: `${prefix}${TEXT_EMPTY_MESSAGE_SUFFIX}`,
      },
      {
        name: 'string with only tabs',
        input: '\t\t\t',
        expectedMessage: `${prefix}${TEXT_EMPTY_MESSAGE_SUFFIX}`,
      },
      {
        name: 'string with only newlines',
        input: '\n\n\n',
        expectedMessage: `${prefix}${TEXT_EMPTY_MESSAGE_SUFFIX}`,
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
