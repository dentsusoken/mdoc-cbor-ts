import { Mac0 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  createMac0Schema,
  mac0InvalidTypeMessage,
  mac0RequiredMessage,
  mac0TooFewMessage,
  mac0TooManyMessage,
} from '../Mac0';

describe('Mac0', () => {
  const schema = createMac0Schema('DeviceMac');

  describe('should accept valid COSE_Mac0 arrays', () => {
    it('should parse a valid 4-element array to Mac0', () => {
      const protectedHeaders = Uint8Array.from([]);
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = Uint8Array.from([]);
      const tag = Uint8Array.from([]);

      const input = [protectedHeaders, unprotectedHeaders, payload, tag];
      const result = schema.parse(input);

      expect(result).toBeInstanceOf(Mac0);
      expect(result).toEqual(
        new Mac0(protectedHeaders, unprotectedHeaders, payload, tag)
      );
    });

    it('should pass null payload through to Mac0 (as unknown as Uint8Array)', () => {
      const protectedHeaders = Uint8Array.from([]);
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = null;
      const tag = Uint8Array.from([]);

      const input = [protectedHeaders, unprotectedHeaders, payload, tag];
      const result = schema.parse(input);

      expect(result).toBeInstanceOf(Mac0);
      expect(result).toEqual(
        new Mac0(
          protectedHeaders,
          unprotectedHeaders,
          payload as unknown as Uint8Array,
          tag
        )
      );
    });

    it('should pass undefined payload through to Mac0 (as unknown as Uint8Array)', () => {
      const protectedHeaders = Uint8Array.from([]);
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = undefined;
      const tag = Uint8Array.from([]);

      const input = [protectedHeaders, unprotectedHeaders, payload, tag];
      const result = schema.parse(input);

      expect(result).toBeInstanceOf(Mac0);
      expect(result).toEqual(
        new Mac0(
          protectedHeaders,
          unprotectedHeaders,
          payload as unknown as Uint8Array,
          tag
        )
      );
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const invalidMessage = mac0InvalidTypeMessage('DeviceMac');
    const requiredMessage = mac0RequiredMessage('DeviceMac');

    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      { name: 'null input', input: null, expected: invalidMessage },
      { name: 'boolean input', input: true, expected: invalidMessage },
      { name: 'number input', input: 123, expected: invalidMessage },
      { name: 'string input', input: 'string', expected: invalidMessage },
      { name: 'plain object input', input: {}, expected: invalidMessage },
      { name: 'undefined input', input: undefined, expected: requiredMessage },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          schema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should enforce array length = 4', () => {
    it('should reject arrays with too few elements', () => {
      const input = [
        Uint8Array.from([]),
        new Map<number, unknown>(),
        Uint8Array.from([]),
      ];
      try {
        schema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(mac0TooFewMessage('DeviceMac'));
      }
    });

    it('should reject arrays with too many elements', () => {
      const input = [
        Uint8Array.from([]),
        new Map<number, unknown>(),
        Uint8Array.from([]),
        Uint8Array.from([]),
        'extra',
      ];
      try {
        schema.parse(input as never);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          mac0TooManyMessage('DeviceMac')
        );
      }
    });
  });
});
