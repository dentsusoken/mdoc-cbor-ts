import { describe, expect, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { deviceKeyInfoSchema } from '../DeviceKeyInfo';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';
import type { DeviceKey } from '../DeviceKey';
import type { KeyAuthorizations } from '../KeyAuthorizations';
import type { KeyInfo } from '../KeyInfo';

describe('DeviceKeyInfo', () => {
  describe('valid inputs', () => {
    it('should accept required fields only', () => {
      const deviceKey = new Map<number, unknown>([[1, 2]]);
      const input = new Map<string, unknown>([['deviceKey', deviceKey]]);
      const result = deviceKeyInfoSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result.get('deviceKey')).toEqual(deviceKey);
      // type assertions
      expectTypeOf(result.get('deviceKey')).toEqualTypeOf<
        DeviceKey | undefined
      >();
      expectTypeOf(result.get('keyAuthorizations')).toEqualTypeOf<
        KeyAuthorizations | undefined
      >();
      expectTypeOf(result.get('keyInfo')).toEqualTypeOf<KeyInfo | undefined>();
    });

    it('should accept all fields', () => {
      const deviceKey = new Map<number, unknown>([[1, 2]]);
      const input = new Map<string, unknown>([
        ['deviceKey', deviceKey],
        ['keyAuthorizations', new Map()],
        ['keyInfo', new Map()],
      ]);
      const result = deviceKeyInfoSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result.get('deviceKey')).toEqual(deviceKey);
      const ka = result.get('keyAuthorizations');
      expect(ka).toBeInstanceOf(Map);
      expect((ka as Map<unknown, unknown>).size).toBe(0);
      const ki = result.get('keyInfo');
      expect(ki).toBeInstanceOf(Map);
      expect((ki as Map<unknown, unknown>).size).toBe(0);
      // type assertions
      expectTypeOf(result.get('deviceKey')).toEqualTypeOf<
        DeviceKey | undefined
      >();
      expectTypeOf(result.get('keyAuthorizations')).toEqualTypeOf<
        KeyAuthorizations | undefined
      >();
      expectTypeOf(result.get('keyInfo')).toEqualTypeOf<KeyInfo | undefined>();
    });
  });

  describe('invalid container types', () => {
    const expectedMessage = (v: unknown): string =>
      containerInvalidTypeMessage({
        target: 'DeviceKeyInfo',
        expected: 'Map',
        received: getTypeName(v),
      });

    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'string',
        input: 'not-a-map',
        expected: expectedMessage('not-a-map'),
      },
      {
        name: 'number',
        input: 123,
        expected: expectedMessage(123),
      },
      {
        name: 'boolean',
        input: true,
        expected: expectedMessage(true),
      },
      {
        name: 'null',
        input: null,
        expected: expectedMessage(null),
      },
      {
        name: 'plain object',
        input: { deviceKey: new Map([[1, 2]]) },
        expected: expectedMessage({ deviceKey: new Map([[1, 2]]) }),
      },
      {
        name: 'array',
        input: [['deviceKey', new Map([[1, 2]])]],
        expected: expectedMessage([['deviceKey', new Map([[1, 2]])]]),
      },
      {
        name: 'set',
        input: new Set([1]),
        expected: expectedMessage(new Set([1])),
      },
      {
        name: 'undefined',
        input: undefined,
        expected: expectedMessage(undefined),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          deviceKeyInfoSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
