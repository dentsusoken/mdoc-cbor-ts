import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { z } from 'zod';
import { deviceNameSpacesBytesSchema } from '../DeviceNameSpacesBytes';
import { createTag24 } from '@/cbor';
import { tag24InvalidTypeMessage } from '@/schemas/cbor/EmbeddedCbor';
import { requiredMessage } from '@/schemas/common/Required';

describe('DeviceNameSpacesBytes', () => {
  describe('should accept valid CBOR Tag24 inputs', () => {
    it('should accept non-empty namespaces encoded as Tag24', () => {
      const input = createTag24({
        'org.iso.18013.5.1': {
          given_name: 'John',
        },
      });

      const result = deviceNameSpacesBytesSchema.parse(input);
      expect(result).toBeInstanceOf(Tag);
      expect(result.value).toBeInstanceOf(Uint8Array);
    });
  });

  describe('should throw specific error messages for invalid input', () => {
    const target = 'DeviceNameSpacesBytes';
    const schemaMessage = tag24InvalidTypeMessage(target);
    const requiredMsg = requiredMessage(target);
    const testCases = [
      { name: 'null input', input: null, expectedMessage: requiredMsg },
      {
        name: 'undefined input',
        input: undefined,
        expectedMessage: requiredMsg,
      },
      { name: 'boolean input', input: true, expectedMessage: schemaMessage },
      { name: 'number input', input: 123, expectedMessage: schemaMessage },
      { name: 'string input', input: 'string', expectedMessage: schemaMessage },
      { name: 'array input', input: [], expectedMessage: schemaMessage },
      { name: 'object input', input: {}, expectedMessage: schemaMessage },
      {
        name: 'tag-like object input',
        input: { tag: 24, value: 0 },
        expectedMessage: schemaMessage,
      },
    ];

    testCases.forEach(({ name, input, expectedMessage }) => {
      it(`should throw error for ${name}`, () => {
        try {
          deviceNameSpacesBytesSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedMessage);
        }
      });
    });
  });
});
