import { describe, expect, it } from 'vitest';
import { dataElementIdentifierSchema } from '../DataElementIdentifier';
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
    const testCases = [
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'DataElementIdentifier: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'DataElementIdentifier: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage:
          'DataElementIdentifier: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage:
          'DataElementIdentifier: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'DataElementIdentifier: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'DataElementIdentifier: This field is required. Please provide a string identifier.',
      },
      {
        name: 'empty string',
        input: '',
        expectedMessage:
          'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
      },
      {
        name: 'whitespace-only string',
        input: '   ',
        expectedMessage:
          'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
      },
      {
        name: 'string with only tabs',
        input: '\t\t\t',
        expectedMessage:
          'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
      },
      {
        name: 'string with only newlines',
        input: '\n\n\n',
        expectedMessage:
          'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
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
