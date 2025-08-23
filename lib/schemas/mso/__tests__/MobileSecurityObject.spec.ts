import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { mobileSecurityObjectSchema } from '../MobileSecurityObject';
import { DateTime } from '@/cbor/DateTime';
import { mapInvalidTypeMessage } from '@/schemas/common/Map';
import { DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE } from '../DigestAlgorithm';
import { ExactKeyMap } from 'exact-key-map';
import { deviceKeySchema } from '../DeviceKey';
import { VERSION_INVALID_VALUE_MESSAGE } from '@/schemas/common/Version';
import { nonEmptyTextRequiredMessage } from '@/schemas/common/NonEmptyText';

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

const validMSOMap = ExactKeyMap.fromEntries(validMSO);

describe('MobileSecurityObject Schema', () => {
  describe('valid cases', () => {
    it('should validate a complete MobileSecurityObject', () => {
      const input = validMSOMap;
      const result = mobileSecurityObjectSchema.parse(input);

      expect(result.version).toBe('1.0');
      expect(result.digestAlgorithm).toBe('SHA-256');
      expect(result.docType).toBe('org.iso.18013.5.1.mDL');

      // Validate valueDigests structure (Map)
      const valueDigest = result.valueDigests.get('org.iso.18013.5.1');
      expect(valueDigest).toBeDefined();
      const digestValue = valueDigest?.get(1);
      expect(digestValue).toEqual(new Uint8Array([1]));

      // Validate deviceKeyInfo structure (object)
      const deviceKey = result.deviceKeyInfo.deviceKey;
      expect(deviceKey).toEqual(deviceKeySchema.parse(new Map([[1, 2]])));

      // Validate validityInfo structure (object)
      const signed = result.validityInfo.signed;
      const validFrom = result.validityInfo.validFrom;
      const validUntil = result.validityInfo.validUntil;
      expect(signed).toBeInstanceOf(DateTime);
      expect(signed.toISOString()).toBe('2024-03-20T10:00:00Z');
      expect(validFrom).toBeInstanceOf(DateTime);
      expect(validFrom.toISOString()).toBe('2024-03-20T10:00:00Z');
      expect(validUntil).toBeInstanceOf(DateTime);
      expect(validUntil.toISOString()).toBe('2025-03-20T10:00:00Z');
    });
  });

  describe('invalid cases', () => {
    it('should throw when container is not a Map', () => {
      try {
        mobileSecurityObjectSchema.parse({});
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            mapInvalidTypeMessage('MobileSecurityObject')
          );
        }
      }
    });

    it('should throw when digestAlgorithm is invalid value', () => {
      const invalidInput = [...validMSO] as [string, unknown][];
      invalidInput[1] = ['digestAlgorithm', 'SHA-1'];
      const input = ExactKeyMap.fromEntries(invalidInput);

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE
          );
        }
      }
    });

    it('should throw when version is missing', () => {
      const invalidInput = [...validMSO] as [string, unknown][];
      invalidInput.splice(0, 1); // Remove version field
      const input = ExactKeyMap.fromEntries(invalidInput);

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(VERSION_INVALID_VALUE_MESSAGE);
        }
      }
    });

    it('should throw when docType is missing', () => {
      const invalidInput = [...validMSO] as [string, unknown][];
      invalidInput.splice(4, 1); // Remove docType field (index 4)
      const input = ExactKeyMap.fromEntries(invalidInput);

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            nonEmptyTextRequiredMessage('DocType')
          );
        }
      }
    });

    it('should throw when version has invalid value', () => {
      const invalidInput = [...validMSO] as [string, unknown][];
      invalidInput[0] = ['version', '2.0'];
      const input = ExactKeyMap.fromEntries(invalidInput);

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(VERSION_INVALID_VALUE_MESSAGE);
        }
      }
    });

    it('should throw when valueDigests has invalid type', () => {
      const invalidInput = [...validMSO] as [string, unknown][];
      invalidInput[2] = ['valueDigests', 'invalid-value'];
      const input = ExactKeyMap.fromEntries(invalidInput);

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            mapInvalidTypeMessage('ValueDigests')
          );
        }
      }
    });

    it('should throw when deviceKeyInfo has invalid type', () => {
      const invalidInput = [...validMSO] as [string, unknown][];
      invalidInput[3] = ['deviceKeyInfo', 'invalid-value'];
      const input = ExactKeyMap.fromEntries(invalidInput);

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            mapInvalidTypeMessage('DeviceKeyInfo')
          );
        }
      }
    });

    it('should throw when validityInfo has invalid type', () => {
      const invalidInput = [...validMSO] as [string, unknown][];
      invalidInput[5] = ['validityInfo', 'invalid-value'];
      const input = ExactKeyMap.fromEntries(invalidInput);

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            mapInvalidTypeMessage('ValidityInfo')
          );
        }
      }
    });
  });
});
