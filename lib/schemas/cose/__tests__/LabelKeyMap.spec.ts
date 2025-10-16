import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createLabelKeyMapSchema } from '../LabelKeyMap';
import { labelInvalidTypeMessage } from '../Label';
import {
  mapInvalidTypeMessage,
  mapEmptyMessage,
} from '@/schemas/common/containers/Map';
import { requiredMessage } from '@/schemas/common/Required';

describe('LabelKeyMap', () => {
  describe('valid cases', () => {
    it('should accept empty map when allowEmpty=true (default)', () => {
      const schema = createLabelKeyMapSchema('Headers');
      const input = new Map<number | string, unknown>();
      const result = schema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(input);
    });

    it('should accept map with number and string labels', () => {
      const schema = createLabelKeyMapSchema('Headers');
      const input = new Map<number | string, unknown>([
        [1, 'value'],
        ['alg', 7],
      ]);
      const result = schema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(input);
    });
  });

  describe('invalid cases', () => {
    describe('should reject non-Map inputs with consistent message', () => {
      const schema = createLabelKeyMapSchema('Headers');
      const cases: Array<{ name: string; input: unknown; expected: string }> = [
        {
          name: 'plain object',
          input: {},
          expected: mapInvalidTypeMessage('Headers'),
        },
        {
          name: 'array',
          input: [],
          expected: mapInvalidTypeMessage('Headers'),
        },
        {
          name: 'null',
          input: null,
          expected: requiredMessage('Headers'),
        },
        {
          name: 'boolean',
          input: true,
          expected: mapInvalidTypeMessage('Headers'),
        },
        {
          name: 'number',
          input: 123,
          expected: mapInvalidTypeMessage('Headers'),
        },
        {
          name: 'string',
          input: 'str',
          expected: mapInvalidTypeMessage('Headers'),
        },
        {
          name: 'undefined',
          input: undefined,
          expected: requiredMessage('Headers'),
        },
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

    it('should reject empty map when allowEmpty=false', () => {
      const schema = createLabelKeyMapSchema('Headers', false);
      try {
        schema.parse(new Map());
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(mapEmptyMessage('Headers'));
      }
    });

    it('should reject invalid label types in keys', () => {
      const schema = createLabelKeyMapSchema('Headers');
      const invalidKeyMap = new Map<unknown, unknown>([[{}, 'value']]);

      try {
        schema.parse(invalidKeyMap as never);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          labelInvalidTypeMessage('Label')
        );
      }
    });
  });
});
