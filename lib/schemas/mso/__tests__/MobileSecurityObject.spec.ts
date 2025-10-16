import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { mobileSecurityObjectSchema } from '../MobileSecurityObject';
import {
  strictMapMissingKeysMessage,
  strictMapNotMapMessage,
  strictMapKeyValueMessage,
} from '@/schemas/common/container/StrictMap';
import { mapInvalidTypeMessage } from '@/schemas/common/container/Map';
import { DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE } from '../DigestAlgorithm';
import { deviceKeySchema } from '../DeviceKey';
import { VERSION_INVALID_VALUE_MESSAGE } from '@/schemas/common/Version';
import { Tag } from 'cbor-x';

const validMSOMap = new Map<string, unknown>([
  ['version', '1.0'],
  ['digestAlgorithm', 'SHA-256'],
  [
    'valueDigests',
    new Map([['org.iso.18013.5.1', new Map([[1, new Uint8Array([1])]])]]),
  ],
  ['deviceKeyInfo', new Map([['deviceKey', new Map([[1, 2]])]])],
  ['docType', 'org.iso.18013.5.1.mDL'],
  [
    'validityInfo',
    new Map([
      ['signed', '2024-03-20T10:00:00Z'],
      ['validFrom', '2024-03-20T10:00:00Z'],
      ['validUntil', '2025-03-20T10:00:00Z'],
    ]),
  ],
]);

describe('MobileSecurityObject Schema', () => {
  describe('valid cases', () => {
    it('should validate a complete MobileSecurityObject', () => {
      const input = validMSOMap;
      const result = mobileSecurityObjectSchema.parse(input);

      expect(result).toBeInstanceOf(Map);
      expect(result.get('version')).toBe('1.0');
      expect(result.get('digestAlgorithm')).toBe('SHA-256');
      expect(result.get('docType')).toBe('org.iso.18013.5.1.mDL');

      // Validate valueDigests structure (Map)
      const valueDigests = result.get('valueDigests') as Map<
        string,
        Map<number, Uint8Array>
      >;
      const valueDigest = valueDigests.get('org.iso.18013.5.1');
      expect(valueDigest).toBeDefined();
      const digestValue = valueDigest?.get(1);
      expect(digestValue).toEqual(new Uint8Array([1]));

      // Validate deviceKeyInfo structure (object)
      const deviceKeyInfo = result.get('deviceKeyInfo') as {
        deviceKey: unknown;
      };
      const deviceKey = deviceKeyInfo.deviceKey;
      expect(deviceKey).toEqual(deviceKeySchema.parse(new Map([[1, 2]])));

      // Validate validityInfo structure (object)
      const validityInfo = result.get('validityInfo') as Map<string, Tag>;
      const signed = validityInfo.get('signed');
      const validFrom = validityInfo.get('validFrom');
      const validUntil = validityInfo.get('validUntil');
      expect(signed).toEqual(new Tag('2024-03-20T10:00:00Z', 0));
      expect(validFrom).toEqual(new Tag('2024-03-20T10:00:00Z', 0));
      expect(validUntil).toEqual(new Tag('2025-03-20T10:00:00Z', 0));
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
            strictMapNotMapMessage('MobileSecurityObject', 'Object')
          );
        }
      }
    });

    it('should throw when digestAlgorithm is invalid value', () => {
      const input = new Map(validMSOMap);
      input.set('digestAlgorithm', 'SHA-1');

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            strictMapKeyValueMessage(
              'MobileSecurityObject',
              ['digestAlgorithm'],
              DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE
            )
          );
        }
      }
    });

    it('should throw when version is missing', () => {
      const input = new Map(validMSOMap);
      input.delete('version');

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            strictMapMissingKeysMessage('MobileSecurityObject', ['version'])
          );
        }
      }
    });

    it('should throw when docType is missing', () => {
      const input = new Map(validMSOMap);
      input.delete('docType');

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            strictMapMissingKeysMessage('MobileSecurityObject', ['docType'])
          );
        }
      }
    });

    it('should throw when version has invalid value', () => {
      const input = new Map(validMSOMap);
      input.set('version', '2.0');

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            strictMapKeyValueMessage(
              'MobileSecurityObject',
              ['version'],
              VERSION_INVALID_VALUE_MESSAGE
            )
          );
        }
      }
    });

    it('should throw when valueDigests has invalid type', () => {
      const input = new Map(validMSOMap);
      input.set('valueDigests', 'invalid-value');

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            strictMapKeyValueMessage(
              'MobileSecurityObject',
              ['valueDigests'],
              mapInvalidTypeMessage('ValueDigests')
            )
          );
        }
      }
    });

    it('should throw when deviceKeyInfo has invalid type', () => {
      const input = new Map(validMSOMap);
      input.set('deviceKeyInfo', 'invalid-value');

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            strictMapKeyValueMessage(
              'MobileSecurityObject',
              ['deviceKeyInfo'],
              mapInvalidTypeMessage('DeviceKeyInfo')
            )
          );
        }
      }
    });

    it('should throw when validityInfo has invalid type', () => {
      const input = new Map(validMSOMap);
      input.set('validityInfo', 'invalid-value');

      try {
        mobileSecurityObjectSchema.parse(input);
        expect.fail('Expected parse to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.issues[0].message).toBe(
            strictMapKeyValueMessage(
              'MobileSecurityObject',
              ['validityInfo'],
              strictMapNotMapMessage('ValidityInfo', 'String')
            )
          );
        }
      }
    });
  });
});
