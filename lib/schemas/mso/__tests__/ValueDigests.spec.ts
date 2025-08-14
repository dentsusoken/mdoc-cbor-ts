import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { valueDigestsSchema } from '../ValueDigests';
import {
  MAP_INVALID_TYPE_MESSAGE_SUFFIX,
  MAP_EMPTY_MESSAGE_SUFFIX,
} from '@/schemas/common/Map';
import { TEXT_EMPTY_MESSAGE_SUFFIX } from '@/schemas/common/Text';

// Helper to build a valid DigestIDs map (DigestID must be > 0)
const buildDigestIDs = (): Map<number, Uint8Array> =>
  new Map<number, Uint8Array>([[1, new Uint8Array([0x01, 0x02, 0x03])]]);

describe('ValueDigests Schema', () => {
  describe('valid cases', () => {
    it('should validate a non-empty Map<NameSpace, DigestIDs>', () => {
      const input = new Map<string, unknown>([
        ['org.iso.18013.5.1', buildDigestIDs()],
      ]);
      const result = valueDigestsSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.get('org.iso.18013.5.1')).toEqual(buildDigestIDs());
    });
  });

  describe('invalid cases', () => {
    type Case = {
      name: string;
      input: unknown;
      expectedMessage: string;
    };

    const cases: Case[] = [
      {
        name: 'input is not a Map',
        input: {},
        expectedMessage: `ValueDigests: ${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
      {
        name: 'Map is empty by default',
        input: new Map<string, unknown>(),
        expectedMessage: `ValueDigests: ${MAP_EMPTY_MESSAGE_SUFFIX}`,
      },
      {
        name: 'NameSpace key is invalid (empty)',
        input: new Map<string, unknown>([['', buildDigestIDs()]]),
        expectedMessage: `NameSpace: ${TEXT_EMPTY_MESSAGE_SUFFIX}`,
      },
      {
        name: 'DigestIDs value is invalid (not a Map)',
        input: new Map<string, unknown>([['org.iso.18013.5.1', {}]]),
        expectedMessage: `DigestIDs: ${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      },
    ];

    cases.forEach(({ name, input, expectedMessage }) => {
      it(name, () => {
        try {
          valueDigestsSchema.parse(input);
          throw new Error('Expected error');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          if (error instanceof z.ZodError) {
            expect(error.errors[0].message).toBe(expectedMessage);
          }
        }
      });
    });
  });
});
