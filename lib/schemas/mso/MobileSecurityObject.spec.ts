import { COSEKey } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { DateTime } from '../../cbor';
import { mobileSecurityObjectSchema } from './MobileSecurityObject';

describe('MobileSecurityObject', () => {
  it('should accept valid mobile security object', () => {
    const validMSO = new Map<string, any>([
      ['version', '1.0'],
      ['digestAlgorithm', 'SHA-256'],
      [
        'valueDigests',
        new Map<string, any>([
          [
            'org.iso.18013.5.1',
            new Map<number, Buffer>([[1, Buffer.from('0123456789abcdef')]]),
          ],
        ]),
      ],
      [
        'deviceKeyInfo',
        new Map<string, any>([['deviceKey', new Map<number, any>()]]),
      ],
      ['docType', 'org.iso.18013.5.1.mDL'],
      [
        'validityInfo',
        new Map<string, any>([
          ['signed', new DateTime('2024-03-20T00:00:00Z')],
          ['validFrom', new DateTime('2024-03-20T00:00:00Z')],
          ['validUntil', new DateTime('2024-03-21T00:00:00Z')],
        ]),
      ],
    ]);

    expect(() => mobileSecurityObjectSchema.parse(validMSO)).not.toThrow();
    const result = mobileSecurityObjectSchema.parse(validMSO);
    expect(result).toEqual({
      version: '1.0',
      digestAlgorithm: 'SHA-256',
      valueDigests: {
        'org.iso.18013.5.1': {
          '1': Buffer.from('0123456789abcdef'),
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
    });
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
      new Map<string, any>([
        ['version', '2.0'],
        ['digestAlgorithm', 'SHA-256'],
        ['valueDigests', new Map()],
        [
          'deviceKeyInfo',
          new Map<string, any>([['deviceKey', new Map<number, any>()]]),
        ],
        ['docType', 'org.iso.18013.5.1.mDL'],
        [
          'validityInfo',
          new Map<string, any>([
            ['signed', new DateTime('2024-03-20T00:00:00Z')],
            ['validFrom', new DateTime('2024-03-20T00:00:00Z')],
            ['validUntil', new DateTime('2024-03-21T00:00:00Z')],
          ]),
        ],
      ]),
      new Map<string, any>([
        ['version', '1.0'],
        ['digestAlgorithm', 'MD5'],
        ['valueDigests', new Map()],
        [
          'deviceKeyInfo',
          new Map<string, any>([['deviceKey', new Map<number, any>()]]),
        ],
        ['docType', 'org.iso.18013.5.1.mDL'],
        [
          'validityInfo',
          new Map<string, any>([
            ['signed', new DateTime('2024-03-20T00:00:00Z')],
            ['validFrom', new DateTime('2024-03-20T00:00:00Z')],
            ['validUntil', new DateTime('2024-03-21T00:00:00Z')],
          ]),
        ],
      ]),
      new Map<string, any>([
        ['version', '1.0'],
        ['digestAlgorithm', 'SHA-256'],
        ['valueDigests', new Map()],
        ['deviceKeyInfo', new Map<string, any>([['deviceKey', {}]])],
        ['docType', 'org.iso.18013.5.1.mDL'],
        [
          'validityInfo',
          new Map<string, any>([
            ['signed', new DateTime('2024-03-20T00:00:00Z')],
            ['validFrom', new DateTime('2024-03-20T00:00:00Z')],
            ['validUntil', new DateTime('2024-03-21T00:00:00Z')],
          ]),
        ],
      ]),
      new Map<string, any>([
        ['version', '1.0'],
        ['digestAlgorithm', 'SHA-256'],
        ['valueDigests', new Map()],
        [
          'deviceKeyInfo',
          new Map<string, any>([['deviceKey', new Map<number, any>()]]),
        ],
        ['docType', ''],
        [
          'validityInfo',
          new Map<string, any>([
            ['signed', new DateTime('2024-03-20T00:00:00Z')],
            ['validFrom', new DateTime('2024-03-20T00:00:00Z')],
            ['validUntil', new DateTime('2024-03-21T00:00:00Z')],
          ]),
        ],
      ]),
      new Map<string, any>([
        ['version', '1.0'],
        ['digestAlgorithm', 'SHA-256'],
        ['valueDigests', new Map()],
        [
          'deviceKeyInfo',
          new Map<string, any>([['deviceKey', new Map<number, any>()]]),
        ],
        ['docType', 'org.iso.18013.5.1.mDL'],
        [
          'validityInfo',
          new Map<string, any>([
            ['signed', '2024-03-20T00:00:00Z'],
            ['validFrom', new DateTime('2024-03-20T00:00:00Z')],
            ['validUntil', new DateTime('2024-03-21T00:00:00Z')],
          ]),
        ],
      ]),
    ];

    invalidInputs.forEach((input) => {
      expect(() => mobileSecurityObjectSchema.parse(input)).toThrow();
    });
  });
});
