import { COSEKey } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { mobileSecurityObjectSchema } from './MobileSecurityObject';

describe('MobileSecurityObject', () => {
  it('should accept valid mobile security object', () => {
    const validMSO = {
      version: '1.0',
      digestAlgorithm: 'SHA-256',
      valueDigests: {
        'org.iso.18013.5.1': {
          0: Buffer.from('0123456789abcdef'),
        },
      },
      deviceKeyInfo: {
        deviceKey: new COSEKey([]),
      },
      docType: 'org.iso.18013.5.1.mDL',
      validityInfo: {
        signed: new Date('2024-03-20T00:00:00Z'),
        validFrom: new Date('2024-03-20T00:00:00Z'),
        validUntil: new Date('2024-03-21T00:00:00Z'),
      },
    };

    expect(() => mobileSecurityObjectSchema.parse(validMSO)).not.toThrow();
    const result = mobileSecurityObjectSchema.parse(validMSO);
    expect(result).toEqual(validMSO);
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      {},
      {
        version: '2.0',
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        deviceKeyInfo: {
          deviceKey: new COSEKey([]),
        },
        docType: 'org.iso.18013.5.1.mDL',
        validityInfo: {
          signed: new Date('2024-03-20T00:00:00Z'),
          validFrom: new Date('2024-03-20T00:00:00Z'),
          validUntil: new Date('2024-03-21T00:00:00Z'),
        },
      },
      {
        version: '1.0',
        digestAlgorithm: 'MD5',
        valueDigests: {},
        deviceKeyInfo: {
          deviceKey: new COSEKey([]),
        },
        docType: 'org.iso.18013.5.1.mDL',
        validityInfo: {
          signed: new Date('2024-03-20T00:00:00Z'),
          validFrom: new Date('2024-03-20T00:00:00Z'),
          validUntil: new Date('2024-03-21T00:00:00Z'),
        },
      },
      {
        version: '1.0',
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        deviceKeyInfo: {
          deviceKey: {},
        },
        docType: 'org.iso.18013.5.1.mDL',
        validityInfo: {
          signed: new Date('2024-03-20T00:00:00Z'),
          validFrom: new Date('2024-03-20T00:00:00Z'),
          validUntil: new Date('2024-03-21T00:00:00Z'),
        },
      },
      {
        version: '1.0',
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        deviceKeyInfo: {
          deviceKey: new COSEKey([]),
        },
        docType: '',
        validityInfo: {
          signed: new Date('2024-03-20T00:00:00Z'),
          validFrom: new Date('2024-03-20T00:00:00Z'),
          validUntil: new Date('2024-03-21T00:00:00Z'),
        },
      },
      {
        version: '1.0',
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        deviceKeyInfo: {
          deviceKey: new COSEKey([]),
        },
        docType: 'org.iso.18013.5.1.mDL',
        validityInfo: {
          signed: '2024-03-20T00:00:00Z',
          validFrom: new Date('2024-03-20T00:00:00Z'),
          validUntil: new Date('2024-03-21T00:00:00Z'),
        },
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => mobileSecurityObjectSchema.parse(input)).toThrow();
    });
  });
});
