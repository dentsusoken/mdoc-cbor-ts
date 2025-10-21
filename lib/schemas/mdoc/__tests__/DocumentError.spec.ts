import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { documentErrorSchema } from '../DocumentError';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerEmptyMessage } from '@/schemas/messages/containerEmptyMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('DocumentError', () => {
  describe('success cases', () => {
    it('should accept a non-empty map of DocType to ErrorCode', () => {
      const input = new Map<string, number>([['org.iso.18013.5.1', 0]]);
      const result = documentErrorSchema.parse(input);
      expect(result).toEqual(input);
    });
  });

  describe('invalid type inputs', () => {
    const TARGET = 'DocumentError';
    const cases: Array<{ name: string; input: unknown }> = [
      { name: 'object', input: {} },
      { name: 'array', input: [] },
      { name: 'string', input: 'hello' },
      { name: 'number', input: 123 },
      { name: 'boolean', input: true },
      { name: 'null', input: null },
      { name: 'undefined', input: undefined },
    ];

    cases.forEach(({ name, input }) => {
      it(`should reject ${name} with exact invalid type message`, () => {
        const expected = containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(input),
        });
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          documentErrorSchema.parse(input as any);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('nonempty behavior', () => {
    it('should reject empty map with containerEmptyMessage', () => {
      try {
        documentErrorSchema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          containerEmptyMessage('DocumentError')
        );
      }
    });
  });

  describe('invalid entries - key', () => {
    it('should include index and key in the error message', () => {
      const input = new Map<string, unknown>([['', 0]]);
      try {
        documentErrorSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual([0, 'key']);
        const expected = containerInvalidValueMessage({
          target: 'DocumentError',
          path: issue.path,
          originalMessage: 'String must contain at least 1 character(s)',
        });
        expect(issue.message).toBe(expected);
      }
    });
  });

  describe('invalid entries - value', () => {
    it('should include index and value in the error message', () => {
      const input = new Map<string, unknown>([['org.iso.18013.5.1', 'x']]);
      try {
        documentErrorSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual([0, 'value']);
        const expected = containerInvalidValueMessage({
          target: 'DocumentError',
          path: issue.path,
          originalMessage: 'Expected number, received string',
        });
        expect(issue.message).toBe(expected);
      }
    });
  });
});
