import { describe, expect, it } from 'vitest';
import { docTypeSchema } from '../DocType';
import { z } from 'zod';

describe('DocType', () => {
  describe('should accept valid document type strings', () => {
    const testCases = [
      {
        name: 'ISO standard document type',
        input: 'org.iso.18013.5.1.mDL',
      },
      {
        name: 'custom document type with dots',
        input: 'com.example.document',
      },
      {
        name: 'simple test document type',
        input: 'test.document',
      },
      {
        name: 'multi-level document type',
        input: 'a.b.c.document',
      },
      {
        name: 'single word document type',
        input: 'document',
      },
      {
        name: 'document type with numbers',
        input: 'org.example.123.456.document',
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        const result = docTypeSchema.parse(input);
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
          'DocType: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'DocType: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage:
          'DocType: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage:
          'DocType: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'DocType: Expected a string, but received a different type. Please provide a string identifier.',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'DocType: This field is required. Please provide a string identifier.',
      },
      {
        name: 'empty string',
        input: '',
        expectedMessage:
          'DocType: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1.mDL")',
      },
      {
        name: 'whitespace-only string',
        input: '   ',
        expectedMessage:
          'DocType: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1.mDL")',
      },
      {
        name: 'string with only tabs',
        input: '\t\t\t',
        expectedMessage:
          'DocType: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1.mDL")',
      },
      {
        name: 'string with only newlines',
        input: '\n\n\n',
        expectedMessage:
          'DocType: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1.mDL")',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          docTypeSchema.parse(input);
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
