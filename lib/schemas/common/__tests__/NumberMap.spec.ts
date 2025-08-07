import { describe, expect, it } from 'vitest';
import { numberMapSchema } from '../NumberMap';
import { z } from 'zod';

describe('NumberMap', () => {
  describe('should accept valid number maps', () => {
    const testCases = [
      {
        name: 'object with string keys',
        input: {
          '1': 'value1',
          '2': 'value2',
          '3': 'value3',
        },
        expectedEntries: [
          [1, 'value1'],
          [2, 'value2'],
          [3, 'value3'],
        ],
      },
      {
        name: 'object with mixed string/number keys',
        input: {
          '1': 'value1',
          2: 'value2',
          '3': 'value3',
        },
        expectedEntries: [
          [1, 'value1'],
          [2, 'value2'],
          [3, 'value3'],
        ],
      },
      {
        name: 'existing Map',
        input: new Map([
          [1, 'value1'],
          [2, 'value2'],
          [3, 'value3'],
        ]),
        expectedEntries: [
          [1, 'value1'],
          [2, 'value2'],
          [3, 'value3'],
        ],
      },
      {
        name: 'empty object',
        input: {},
        expectedEntries: [],
      },
      {
        name: 'empty Map',
        input: new Map(),
        expectedEntries: [],
      },
    ];

    testCases.forEach(({ name, input, expectedEntries }) => {
      it(`should accept ${name}`, () => {
        const result = numberMapSchema.parse(input);

        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(expectedEntries.length);

        expectedEntries.forEach(([key, value]) => {
          expect(result.get(key as number)).toBe(value);
        });
      });
    });
  });

  describe('should throw error for invalid inputs', () => {
    const testCases = [
      {
        name: 'object with invalid string keys',
        input: { abc: 'value' },
        expectedMessage:
          'NumberMap: Please provide a valid number map (object or Map)',
      },
      {
        name: 'object with negative number keys',
        input: { '-1': 'value' },
        expectedMessage:
          'NumberMap: Please provide a valid number map (object or Map)',
      },
      {
        name: 'object with zero keys',
        input: { '0': 'value' },
        expectedMessage:
          'NumberMap: Please provide a valid number map (object or Map)',
      },
      {
        name: 'object with decimal keys',
        input: { '1.5': 'value' },
        expectedMessage:
          'NumberMap: Please provide a valid number map (object or Map)',
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage:
          'NumberMap: Please provide a valid number map (object or Map)',
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage:
          'NumberMap: Please provide a valid number map (object or Map)',
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage:
          'NumberMap: Please provide a valid number map (object or Map)',
      },
      {
        name: 'null input',
        input: null,
        expectedMessage:
          'NumberMap: Please provide a valid number map (object or Map)',
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage:
          'NumberMap: Please provide a valid number map (object or Map)',
      },
      {
        name: 'array input',
        input: [],
        expectedMessage:
          'NumberMap: Please provide a valid number map (object or Map)',
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          numberMapSchema.parse(input);
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
