import { describe, expect, it } from 'vitest';
import { docTypeSchema } from '../DocType';
import {
  nonEmptyTextInvalidTypeMessage,
  nonEmptyTextEmptyMessage,
} from '../NonEmptyText';
import { z } from 'zod';
import { requiredMessage } from '../Required';

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
        expectedMessage: nonEmptyTextInvalidTypeMessage('DocType'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: nonEmptyTextInvalidTypeMessage('DocType'),
      },
      {
        name: 'object input',
        input: { key: 'value' },
        expectedMessage: nonEmptyTextInvalidTypeMessage('DocType'),
      },
      {
        name: 'array input',
        input: [1, 2, 3],
        expectedMessage: nonEmptyTextInvalidTypeMessage('DocType'),
      },
      {
        name: 'null input',
        input: null,
        expectedMessage: requiredMessage('DocType'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMessage('DocType'),
      },
      {
        name: 'empty string',
        input: '',
        expectedMessage: nonEmptyTextEmptyMessage('DocType'),
      },
      {
        name: 'whitespace-only string',
        input: '   ',
        expectedMessage: nonEmptyTextEmptyMessage('DocType'),
      },
      {
        name: 'string with only tabs',
        input: '\t\t\t',
        expectedMessage: nonEmptyTextEmptyMessage('DocType'),
      },
      {
        name: 'string with only newlines',
        input: '\n\n\n',
        expectedMessage: nonEmptyTextEmptyMessage('DocType'),
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
