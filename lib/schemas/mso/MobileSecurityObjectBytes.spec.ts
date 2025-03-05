import { COSEKey } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { ByteString, DateTime } from '../../cbor';
import { mobileSecurityObjectBytesSchema } from './MobileSecurityObjectBytes';

describe('MobileSecurityObjectBytes', () => {
  it('should accept valid binary data', () => {
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
        signed: new DateTime('2024-03-20T00:00:00Z'),
        validFrom: new DateTime('2024-03-20T00:00:00Z'),
        validUntil: new DateTime('2024-03-21T00:00:00Z'),
      },
    };

    const bytes = new ByteString(validMSO);

    expect(() => mobileSecurityObjectBytesSchema.parse(bytes)).not.toThrow();
    const result = mobileSecurityObjectBytesSchema.parse(bytes);
    expect(result).toEqual(bytes);
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
      expect(() => mobileSecurityObjectBytesSchema.parse(input)).toThrow();
    });
  });
});
