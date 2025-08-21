import { Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { issuerAuthSchema } from '../IssuerAuth';
import {
  sign1InvalidTypeMessage,
  sign1RequiredMessage,
  sign1TooFewMessage,
  sign1TooManyMessage,
} from '@/schemas/cose/Sign1';

describe('IssuerAuth', () => {
  it('should accept valid Sign1 objects', () => {
    const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]);
    const unprotectedHeaders = new Map<number, unknown>([
      [4, new Uint8Array([1, 2, 3])],
    ]);
    const payload = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    const signature = new Uint8Array([
      0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
    ]);
    const input = [protectedHeaders, unprotectedHeaders, payload, signature];

    const result = issuerAuthSchema.parse(input);
    expect(result).toBeInstanceOf(Sign1);
    expect(result).toEqual(
      new Sign1(protectedHeaders, unprotectedHeaders, payload, signature)
    );
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expectedMessage: sign1InvalidTypeMessage('IssuerAuth'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: sign1RequiredMessage('IssuerAuth'),
      },
      {
        name: 'boolean input',
        input: true,
        expectedMessage: sign1InvalidTypeMessage('IssuerAuth'),
      },
      {
        name: 'number input',
        input: 123,
        expectedMessage: sign1InvalidTypeMessage('IssuerAuth'),
      },
      {
        name: 'string input',
        input: 'string',
        expectedMessage: sign1InvalidTypeMessage('IssuerAuth'),
      },
      {
        name: 'object input',
        input: {},
        expectedMessage: sign1InvalidTypeMessage('IssuerAuth'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          issuerAuthSchema.parse(input as unknown);
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
      {
        name: 'empty array',
        input: [],
        expectedMessage: sign1TooFewMessage('IssuerAuth'),
      },
      {
        name: 'array with 1 element',
        input: [Uint8Array.from([])],
        expectedMessage: sign1TooFewMessage('IssuerAuth'),
      },
      {
        name: 'array with 2 elements',
        input: [Uint8Array.from([]), new Map()],
        expectedMessage: sign1TooFewMessage('IssuerAuth'),
      },
      {
        name: 'array with 3 elements',
        input: [Uint8Array.from([]), new Map(), Uint8Array.from([])],
        expectedMessage: sign1TooFewMessage('IssuerAuth'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          issuerAuthSchema.parse(input as unknown);
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('should throw error for array with too many elements', () => {
    const testCases = [
      {
        name: 'array with 5 elements',
        input: [
          Uint8Array.from([]),
          new Map(),
          Uint8Array.from([]),
          Uint8Array.from([]),
          Uint8Array.from([]),
        ],
        expectedMessage: sign1TooManyMessage('IssuerAuth'),
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          issuerAuthSchema.parse(input as unknown);
          throw new Error('Should have thrown');
        } catch (error) {
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });
});
