import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { deviceMacSchema } from '../DeviceMac';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('DeviceMac', () => {
  it('should accept valid Mac0 tuple', () => {
    const protectedHeaders = new Uint8Array([]);
    const unprotectedHeaders = new Map<number, unknown>([
      [1, 'value'],
      [2, 'another'],
    ]);
    const payload = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    const tag = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
    const input = [protectedHeaders, unprotectedHeaders, payload, tag];

    const result = deviceMacSchema.parse(input);
    expect(result.tag).toBe(17);
    expect(result.value).toEqual(input);
  });

  describe('should throw error for invalid type inputs', () => {
    const TARGET = 'DeviceMac';
    const testCases: Array<{
      name: string;
      input: unknown;
      expectedMessage: string;
    }> = [
      {
        name: 'null input',
        input: null,
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(17)',
          received: getTypeName(null),
        }),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(17)',
          received: getTypeName(undefined),
        }),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(17)',
          received: getTypeName(true),
        }),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(17)',
          received: getTypeName(123),
        }),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(17)',
          received: getTypeName('string'),
        }),
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: containerInvalidTypeMessage({
          target: TARGET,
          expected:
            '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(17)',
          received: getTypeName({}),
        }),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceMacSchema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('should throw error for array with too few elements', () => {
    const testCases = [
      { name: 'empty array', input: [] },
      { name: 'array with 1 element', input: [new Uint8Array([])] },
      { name: 'array with 2 elements', input: [new Uint8Array([]), new Map()] },
      {
        name: 'array with 3 elements',
        input: [new Uint8Array([]), new Map(), new Uint8Array([])],
      },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceMacSchema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          const issue = zodError.issues[0];
          expect(issue.message.startsWith('DeviceMac')).toBe(true);
        }
      });
    });
  });

  describe('should throw error for array with too many elements', () => {
    const input = [
      new Uint8Array([]),
      new Map(),
      new Uint8Array([]),
      new Uint8Array([]),
      new Uint8Array([]),
    ];

    it('array with 5 elements', () => {
      try {
        deviceMacSchema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.message.startsWith('DeviceMac')).toBe(true);
      }
    });
  });
});
