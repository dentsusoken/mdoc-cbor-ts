import { describe, it, expect } from 'vitest';
import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { createTupleSchema } from '../Tuple';

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
