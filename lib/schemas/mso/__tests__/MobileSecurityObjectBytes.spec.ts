import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { DateTime } from '@/cbor/DateTime';
import {
  MOBILE_SECURITY_OBJECT_INVALID_TYPE_MESSAGE,
  mobileSecurityObjectBytesSchema,
} from '../MobileSecurityObjectBytes';
import { ExactKeyMap } from 'exact-key-map';
import { Tag } from 'cbor-x';

const validMSO = [
  ['version', '1.0'],
  ['digestAlgorithm', 'SHA-256'],
  ['valueDigests', [['org.iso.18013.5.1', [[1, new Uint8Array([1])]]]]],
  ['deviceKeyInfo', [['deviceKey', [[1, 2]]]]],
  ['docType', 'org.iso.18013.5.1.mDL'],
  [
    'validityInfo',
    [
      ['signed', new DateTime('2024-03-20T10:00:00Z')],
      ['validFrom', new DateTime('2024-03-20T10:00:00Z')],
      ['validUntil', new DateTime('2025-03-20T10:00:00Z')],
    ],
  ],
] as const;

describe('MobileSecurityObjectBytes', () => {
  it('should accept valid tag', () => {
    const msoMap = ExactKeyMap.fromEntries(validMSO);
    const tag = new Tag(msoMap, 24);

    const result = mobileSecurityObjectBytesSchema.parse(tag);
    expect(result).toEqual(tag);
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      { key: 'value' },
      [1, 2, 3],
    ];

    invalidInputs.forEach((input) => {
      try {
        mobileSecurityObjectBytesSchema.parse(input as unknown as Tag);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            MOBILE_SECURITY_OBJECT_INVALID_TYPE_MESSAGE
          );
        }
      }
    });
  });

  it('should throw error when tag number is not 24', () => {
    const msoMap = ExactKeyMap.fromEntries(validMSO);
    const invalidTag = new Tag(msoMap, 25);

    try {
      mobileSecurityObjectBytesSchema.parse(invalidTag);
      throw new Error('Expected error');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      if (error instanceof z.ZodError) {
        expect(error.errors[0].message).toBe(
          MOBILE_SECURITY_OBJECT_INVALID_TYPE_MESSAGE
        );
      }
    }
  });

  it('should throw error when tag value is not a Map', () => {
    const invalidTag = new Tag(
      'not-a-map' as unknown as Map<unknown, unknown>,
      24
    );

    try {
      mobileSecurityObjectBytesSchema.parse(invalidTag);
      throw new Error('Expected error');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      if (error instanceof z.ZodError) {
        expect(error.errors[0].message).toBe(
          MOBILE_SECURITY_OBJECT_INVALID_TYPE_MESSAGE
        );
      }
    }
  });
});
