import { describe, expect, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { createKeyMapSchema } from '@/schemas/cose/KeyMap';
import { Key, type KeyValues } from '@/cose/types';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('keyMapSchema', () => {
  const TARGET = 'KeyMap';
  const schema = createKeyMapSchema(TARGET);

  describe('successful validation', () => {
    it('should parse an empty map (nonempty=false by default)', () => {
      const res = schema.safeParse(new Map());
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.size).toBe(0);
      }
    });

    it('should parse a map with valid COSE key parameter keys and arbitrary values', () => {
      const kid = new Uint8Array([1, 2, 3]);
      const x = new Uint8Array([10, 11]);
      const y = new Uint8Array([12, 13]);
      const map = new Map<KeyValues, unknown>([
        [Key.KeyType, 2], // EC
        [Key.KeyId, kid],
        [Key.Algorithm, -7], // ES256
        [Key.Curve, 1], // P-256
        [Key.x, x],
        [Key.y, y],
      ]);

      const res = schema.safeParse(map);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.get(Key.KeyType)).toBe(2);
        expect(res.data.get(Key.KeyId)).toEqual(kid);
        expect(res.data.get(Key.Algorithm)).toBe(-7);
        expect(res.data.get(Key.Curve)).toBe(1);
        expect(res.data.get(Key.x)).toEqual(x);
        expect(res.data.get(Key.y)).toEqual(y);

        expectTypeOf(res.data.get(Key.Algorithm)).toEqualTypeOf<
          unknown | undefined
        >();
        expectTypeOf(res.data.get(Key.KeyId)).toEqualTypeOf<
          unknown | undefined
        >();
      }
    });
  });

  describe('non-Map inputs', () => {
    const cases: Array<[string, unknown]> = [
      ['object', {}],
      ['array', []],
      ['string', 'hello'],
      ['number', 1],
      ['boolean', true],
      ['null', null],
      ['undefined', undefined],
    ];

    cases.forEach(([name, input]) => {
      it(`should reject ${name} with exact invalid type message`, () => {
        const expected = containerInvalidTypeMessage({
          target: TARGET,
          expected: 'Map',
          received: getTypeName(input),
        });
        const res = schema.safeParse(input as unknown as Map<unknown, unknown>);
        expect(res.success).toBe(false);
        if (!res.success) {
          expect(res.error.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('key validation (native enum)', () => {
    it('should include index and key in the error for an out-of-range number', () => {
      const input = new Map<number | string, unknown>([[999, 'x']]);

      const res = schema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        const issue = res.error.issues[0];
        expect(issue.path).toEqual([0, 'key']);

        // Build exact nested message using zod's native enum error
        const enumMsg = z.nativeEnum(Key).safeParse(999);
        const inner = enumMsg.success ? '' : enumMsg.error.issues[0].message;
        const expected = containerInvalidValueMessage({
          target: TARGET,
          path: issue.path,
          originalMessage: inner,
        });
        expect(issue.message).toBe(expected);
      }
    });

    it('should include index and key in the error for a wrong key type (string)', () => {
      const input = new Map<number | string, unknown>([['kty', 2]]);

      const res = schema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        const issue = res.error.issues[0];
        expect(issue.path).toEqual([0, 'key']);

        // Build exact nested message using zod's native enum error
        const enumMsg = z.nativeEnum(Key).safeParse('kty');
        const inner = enumMsg.success ? '' : enumMsg.error.issues[0].message;
        const expected = containerInvalidValueMessage({
          target: TARGET,
          path: issue.path,
          originalMessage: inner,
        });
        expect(issue.message).toBe(expected);
      }
    });
  });
});
