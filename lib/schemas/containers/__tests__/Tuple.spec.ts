import { describe, it, expect } from 'vitest';
import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { createTupleSchema } from '../Tuple';
import { containerInvalidTypeMessage } from '../../messages/containerInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('createTupleSchema', () => {
  it('parses fixed tuple and preserves output types', () => {
    const schema = createTupleSchema({
      target: 'MyTuple',
      itemSchemas: [z.number(), z.string(), z.boolean()] as const,
    });

    const input = [1, 'a', true];
    const parsed = schema.parse(input);

    // runtime checks
    expect(parsed).toEqual([1, 'a', true]);

    // static type check: parsed is readonly [number, string, boolean]
    expectTypeOf(parsed).toEqualTypeOf<readonly [number, string, boolean]>();
  });

  describe('errors', () => {
    describe('non-array inputs', () => {
      const schema = createTupleSchema({
        target: 'MyTuple',
        itemSchemas: [z.number(), z.string()] as const,
      });

      const cases: Array<[string, unknown]> = [
        ['boolean', true],
        ['object', { key: 'value' }],
        ['string', 'hello'],
        ['number', 123],
        ['symbol', Symbol('s')],
        ['bigint', 1n],
        ['date', new Date()],
        ['regexp', /a/],
        ['class', new (class MyClass {})()],
        ['function', (): number => 1],
        ['map', new Map()],
        ['set', new Set()],
        ['null', null],
        ['undefined', undefined],
      ];

      for (const [name, input] of cases) {
        it(`rejects ${name} with proper invalid type message`, () => {
          try {
            schema.parse(input as unknown as unknown[]);
            throw new Error('Expected error');
          } catch (error) {
            expect(error).toBeInstanceOf(z.ZodError);
            const e = error as z.ZodError;
            expect(e.issues[0].path).toEqual([]);
            const expected = containerInvalidTypeMessage({
              target: 'MyTuple',
              expected: 'Array',
              received: getTypeName(input),
            });
            expect(e.issues[0].message).toBe(expected);
          }
        });
      }
    });
    describe('element type mismatch', () => {
      it('reports messages for wrong element types', () => {
        const schema = createTupleSchema({
          target: 'MyTuple',
          itemSchemas: [z.number(), z.string()] as const,
        });

        try {
          schema.parse(['x', 2]);
          throw new Error('Expected error');
        } catch (err) {
          expect(err).toBeInstanceOf(z.ZodError);
          const e = err as z.ZodError;
          expect(e.issues[0].message).toBe(
            'MyTuple[0]: Expected number, received string'
          );
          expect(e.issues[0].path).toEqual([0]);
          expect(e.issues[1].message).toBe(
            'MyTuple[1]: Expected string, received number'
          );
          expect(e.issues[1].path).toEqual([1]);
        }
      });
    });

    describe('too_small', () => {
      it('reports missing element', () => {
        const schema = createTupleSchema({
          target: 'MyTuple',
          itemSchemas: [z.number(), z.string(), z.boolean()] as const,
        });

        try {
          schema.parse([1, 'a']);
          throw new Error('Expected error');
        } catch (err) {
          expect(err).toBeInstanceOf(z.ZodError);
          const e = err as z.ZodError;
          expect(e.issues[0].message).toBe(
            'MyTuple: Array must contain at least 3 element(s)'
          );
          expect(e.issues[0].path).toEqual([]);
        }
      });
    });

    describe('too_big', () => {
      it('reports extra element', () => {
        const schema = createTupleSchema({
          target: 'MyTuple',
          itemSchemas: [z.number(), z.string()] as const,
        });

        try {
          schema.parse([1, 'a', true]);
          throw new Error('Expected error');
        } catch (err) {
          expect(err).toBeInstanceOf(z.ZodError);
          const e = err as z.ZodError;
          expect(e.issues[0].message).toBe(
            'MyTuple: Array must contain at most 2 element(s)'
          );
          expect(e.issues[0].path).toEqual([]);
        }
      });
    });
  });
});
