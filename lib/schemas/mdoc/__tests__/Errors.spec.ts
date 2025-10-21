import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { errorsSchema } from '../Errors';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerEmptyMessage } from '@/schemas/messages/containerEmptyMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('Errors', () => {
  describe('success cases', () => {
    it('should accept a non-empty map of NameSpace to ErrorItems', () => {
      const ns = 'org.iso.18013.5.1';
      const inner = new Map<string, number>([
        ['given_name', 0],
        ['age_over_18', 1],
      ]);
      const input = new Map<string, Map<string, number>>([[ns, inner]]);
      const result = errorsSchema.parse(input);

      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(input);
    });
  });

  describe('invalid type inputs', () => {
    const TARGET = 'Errors';
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
          errorsSchema.parse(input as any);
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
        errorsSchema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          containerEmptyMessage('Errors')
        );
      }
    });
  });

  describe('invalid entries - key', () => {
    it('should include index and key in the error message', () => {
      const input = new Map<string, unknown>([
        ['', new Map<string, number>([['given_name', 0]])],
      ]);
      try {
        errorsSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual([0, 'key']);
        const expected = containerInvalidValueMessage({
          target: 'Errors',
          path: issue.path,
          originalMessage: 'String must contain at least 1 character(s)',
        });
        expect(issue.message).toBe(expected);
      }
    });
  });

  describe('invalid entries - value', () => {
    it('should include index and value in the error message for nested invalid item', () => {
      const input = new Map<string, unknown>([
        ['org.iso.18013.5.1', new Map<string, unknown>([['given_name', 'x']])],
      ]);
      try {
        errorsSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual([0, 'value', 0, 'value']);
        const expected = containerInvalidValueMessage({
          target: 'Errors',
          path: issue.path,
          originalMessage: 'Expected number, received string',
        });
        expect(issue.message).toBe(expected);
      }
    });

    it('should include index and value in the error message for non-Map value', () => {
      const input = new Map<string, unknown>([
        ['org.iso.18013.5.1', 'not-a-map'],
      ]);
      try {
        errorsSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        const issue = zodError.issues[0];
        expect(issue.path).toEqual([0, 'value']);
        const expectedInner = containerInvalidTypeMessage({
          target: 'ErrorItems',
          expected: 'Map',
          received: getTypeName('not-a-map'),
        });
        const expected = containerInvalidValueMessage({
          target: 'Errors',
          path: issue.path,
          originalMessage: expectedInner,
        });
        expect(issue.message).toBe(expected);
      }
    });
  });
});
