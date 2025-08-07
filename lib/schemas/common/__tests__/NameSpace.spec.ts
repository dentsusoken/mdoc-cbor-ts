import { describe, expect, it } from 'vitest';
import { nameSpaceSchema } from '../NameSpace';
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
    const testCases = [
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'NameSpace: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'NameSpace: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage:
          'NameSpace: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage:
          'NameSpace: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'NameSpace: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'NameSpace: This field is required. Please provide a string identifier.',
      },
      {
        name: 'empty string',
        input: '',
        expectedMessage:
          'NameSpace: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
      },
      {
        name: 'whitespace-only string',
        input: '   ',
        expectedMessage:
          'NameSpace: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
      },
      {
        name: 'string with only tabs',
        input: '\t\t\t',
        expectedMessage:
          'NameSpace: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
      },
      {
        name: 'string with only newlines',
        input: '\n\n\n',
        expectedMessage:
          'NameSpace: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
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
