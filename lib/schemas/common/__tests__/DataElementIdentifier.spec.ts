import { describe, expect, it } from 'vitest';
import { dataElementIdentifierSchema } from '../DataElementIdentifier';
import {
  TEXT_INVALID_TYPE_MESSAGE_SUFFIX,
  TEXT_REQUIRED_MESSAGE_SUFFIX,
  TEXT_NON_EMPTY_MESSAGE_SUFFIX,
} from '../Text';
import { z } from 'zod';

describe('DataElementIdentifier', () => {
  describe('should accept valid data element identifiers', () => {
    const testCases = [
      {
        name: 'ISO standard identifier',
        input: 'org.iso.18013.5.1',
      },
      {
        name: 'custom identifier with dots',
        input: 'com.example.identifier',
      },
      {
        name: 'simple test identifier',
        input: 'test.identifier',
      },
      {
        name: 'multi-level identifier',
        input: 'a.b.c.identifier',
      },
      {
        name: 'single word identifier',
        input: 'identifier',
      },
      {
        name: 'identifier with numbers',
        input: 'org.example.123.456',
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = dataElementIdentifierSchema.parse(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const prefix = 'DataElementIdentifier: ';
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
        expectedMessage: `${prefix}${TEXT_NON_EMPTY_MESSAGE_SUFFIX}`,
      },
      {
        name: 'whitespace-only string',
        input: '   ',
        expectedMessage: `${prefix}${TEXT_NON_EMPTY_MESSAGE_SUFFIX}`,
      },
      {
        name: 'string with only tabs',
        input: '\t\t\t',
        expectedMessage: `${prefix}${TEXT_NON_EMPTY_MESSAGE_SUFFIX}`,
      },
      {
        name: 'string with only newlines',
        input: '\n\n\n',
        expectedMessage: `${prefix}${TEXT_NON_EMPTY_MESSAGE_SUFFIX}`,
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          dataElementIdentifierSchema.parse(input);
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
