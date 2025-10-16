import { describe, expect, it } from 'vitest';
import { createUintKeyMapSchema } from '../UintKeyMap';
import { z } from 'zod';
import { mapInvalidTypeMessage } from '../containers/Map';
import { uintIntegerMessage } from '../Uint';
import { requiredMessage } from '../Required';

describe('UintKeyMap schema', () => {
  describe('success', () => {
    it('accepts empty map', () => {
      const schema = createUintKeyMapSchema('Headers');
      const input = new Map<number, unknown>();
      const result = schema.parse(input);
      expect(result).toEqual(input);
    });

    it('accepts map with uint keys and any values', () => {
      const schema = createUintKeyMapSchema('Headers');
      const input = new Map<number, unknown>([
        [1, 'value'],
        [2, 42],
      ]);
      const result = schema.parse(input);
      expect(result).toEqual(input);
    });
  });

  describe('rejects', () => {
    it('rejects non-Map inputs with proper message', () => {
      const schema = createUintKeyMapSchema('Headers');
      const cases: { input: unknown; expected: string }[] = [
        { input: 'x', expected: mapInvalidTypeMessage('Headers') },
        { input: 1, expected: mapInvalidTypeMessage('Headers') },
        { input: true, expected: mapInvalidTypeMessage('Headers') },
        { input: null, expected: requiredMessage('Headers') },
        { input: {}, expected: mapInvalidTypeMessage('Headers') },
        { input: [], expected: mapInvalidTypeMessage('Headers') },
        { input: undefined, expected: requiredMessage('Headers') },
      ];
      cases.forEach(({ input, expected }) => {
        try {
          schema.parse(input as Map<number, unknown>);
          throw new Error('Expected error');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });

    it('rejects when keys are not uint', () => {
      const schema = createUintKeyMapSchema('Headers');
      const input = new Map<unknown, unknown>([[1.5, 'value']]);
      try {
        schema.parse(input as Map<number, unknown>);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        // Error should come from uint key schema with the configured target "Key"
        expect(zodError.issues[0].message).toBe(uintIntegerMessage('Key'));
      }
    });
  });
});
