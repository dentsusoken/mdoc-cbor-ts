import { describe, expect, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { headerMapSchema, type HeaderMap } from '@/schemas/cose/HeaderMap';
import { Header } from '@/cose/types';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('headerMapSchema', () => {
  const TARGET = 'HeaderMap';

  describe('successful validation', () => {
    it('should parse an empty map (nonempty=false by default)', () => {
      const res = headerMapSchema.safeParse(new Map());
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.size).toBe(0);
      }
    });

    it('should parse a map with valid COSE header keys and arbitrary values', () => {
      const kid = new Uint8Array([1, 2, 3]);
      const map = new Map<number, unknown>([
        [Header.Algorithm, -7],
        [Header.KeyId, kid],
        [Header.ContentType, 'application/cbor'],
        [Header.Critical, [Header.Algorithm, Header.KeyId]],
      ]);

      const res = headerMapSchema.safeParse(map);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.get(Header.Algorithm)).toBe(-7);
        expect(res.data.get(Header.KeyId)).toEqual(kid);
        expect(res.data.get(Header.ContentType)).toBe('application/cbor');
        expect(res.data.get(Header.Critical)).toEqual([
          Header.Algorithm,
          Header.KeyId,
        ]);

        // type expectations
        expectTypeOf(res.data).toEqualTypeOf<HeaderMap>();
        expectTypeOf(res.data.get(Header.Algorithm)).toEqualTypeOf<
          unknown | undefined
        >();
        expectTypeOf(res.data.get(Header.KeyId)).toEqualTypeOf<
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
        const res = headerMapSchema.safeParse(
          input as unknown as Map<unknown, unknown>
        );
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

      const res = headerMapSchema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        const issue = res.error.issues[0];
        expect(issue.path).toEqual([0, 'key']);

        // Build exact nested message using zod's native enum error
        const enumMsg = z.nativeEnum(Header).safeParse(999);
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
      const input = new Map<number | string, unknown>([['alg', -7]]);

      const res = headerMapSchema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        const issue = res.error.issues[0];
        expect(issue.path).toEqual([0, 'key']);

        // Build exact nested message using zod's native enum error
        const enumMsg = z.nativeEnum(Header).safeParse('alg');
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
