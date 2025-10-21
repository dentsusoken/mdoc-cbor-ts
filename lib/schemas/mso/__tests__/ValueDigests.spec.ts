import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { valueDigestsSchema } from '../ValueDigests';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { containerEmptyMessage } from '@/schemas/messages/containerEmptyMessage';
import { getTypeName } from '@/utils/getTypeName';

const digestIDs = new Map<number, Uint8Array>([
  [1, new Uint8Array([0x01, 0x02, 0x03])],
]);

describe('ValueDigests Schema', () => {
  describe('valid cases', () => {
    it('should validate a non-empty Map<NameSpace, DigestIDs>', () => {
      const input = new Map<string, unknown>([
        ['org.iso.18013.5.1', digestIDs],
      ]);
      const result = valueDigestsSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.get('org.iso.18013.5.1')).toEqual(digestIDs);
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
        expectedMessage: containerInvalidTypeMessage({
          target: 'ValueDigests',
          expected: 'Map',
          received: getTypeName({}),
        }),
      },
      {
        name: 'Map is empty by default',
        input: new Map<string, unknown>(),
        expectedMessage: containerEmptyMessage('ValueDigests'),
      },
      {
        name: 'NameSpace key is invalid (empty)',
        input: new Map<string, unknown>([['', digestIDs]]),
        expectedMessage: containerInvalidValueMessage({
          target: 'ValueDigests',
          path: [0, 'key'],
          originalMessage: 'String must contain at least 1 character(s)',
        }),
      },
      {
        name: 'DigestIDs value is invalid (not a Map)',
        input: new Map<string, unknown>([['org.iso.18013.5.1', {}]]),
        expectedMessage: containerInvalidValueMessage({
          target: 'ValueDigests',
          path: [0, 'value'],
          originalMessage: 'Expected Map, received object',
        }),
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
