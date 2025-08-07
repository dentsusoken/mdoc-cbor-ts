import { describe, expect, it } from 'vitest';
import { dataElementValueSchema } from '../DataElementValue';

describe('DataElementValue', () => {
  describe('should accept any value type', () => {
    const testCases = [
      {
        name: 'string value',
        input: 'string',
      },
      {
        name: 'number value',
        input: 123,
      },
      {
        name: 'boolean value',
        input: true,
      },
      {
        name: 'null value',
        input: null,
      },
      {
        name: 'undefined value',
        input: undefined,
      },
      {
        name: 'object value',
        input: { key: 'value' },
      },
      {
        name: 'array value',
        input: [1, 2, 3],
      },
      {
        name: 'Date object',
        input: new Date(),
      },
      {
        name: 'Buffer value',
        input: Buffer.from([1, 2, 3]),
      },
      {
        name: 'Uint8Array value',
        input: new Uint8Array([1, 2, 3]),
      },
      {
        name: 'empty string',
        input: '',
      },
      {
        name: 'zero number',
        input: 0,
      },
      {
        name: 'false boolean',
        input: false,
      },
      {
        name: 'empty object',
        input: {},
      },
      {
        name: 'empty array',
        input: [],
      },
      {
        name: 'nested object',
        input: { nested: { deep: 'value' } },
      },
      {
        name: 'nested array',
        input: [
          [1, 2],
          [3, 4],
        ],
      },
      {
        name: 'function value',
        input: (): string => 'test',
      },
      {
        name: 'symbol value',
        input: Symbol('test'),
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should accept ${name}`, () => {
        expect(() => dataElementValueSchema.parse(input)).not.toThrow();
        expect(dataElementValueSchema.parse(input)).toBe(input);
      });
    });
  });
});
