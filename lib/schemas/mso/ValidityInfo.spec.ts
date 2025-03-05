import { describe, expect, it } from 'vitest';
import { DateTime } from '../../cbor';
import { validityInfoSchema } from './ValidityInfo';

describe('ValidityInfo', () => {
  it('should accept valid validity info with all fields', () => {
    const validInfo = {
      signed: new DateTime('2024-03-20T00:00:00Z'),
      validFrom: new DateTime('2024-03-20T00:00:00Z'),
      validUntil: new DateTime('2024-03-21T00:00:00Z'),
      expectedUpdate: new DateTime('2024-03-22T00:00:00Z'),
    };

    expect(() => validityInfoSchema.parse(validInfo)).not.toThrow();
    const result = validityInfoSchema.parse(validInfo);
    expect(result).toEqual(validInfo);
  });

  it('should accept valid validity info without expectedUpdate', () => {
    const validInfo = {
      signed: new DateTime('2024-03-20T00:00:00Z'),
      validFrom: new DateTime('2024-03-20T00:00:00Z'),
      validUntil: new DateTime('2024-03-21T00:00:00Z'),
    };

    expect(() => validityInfoSchema.parse(validInfo)).not.toThrow();
    const result = validityInfoSchema.parse(validInfo);
    expect(result).toEqual(validInfo);
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
        signed: '2024-03-20T00:00:00Z',
        validFrom: new DateTime('2024-03-20T00:00:00Z'),
        validUntil: new DateTime('2024-03-21T00:00:00Z'),
      },
      {
        signed: new DateTime('2024-03-20T00:00:00Z'),
        validFrom: '2024-03-20T00:00:00Z',
        validUntil: new DateTime('2024-03-21T00:00:00Z'),
      },
      {
        signed: new DateTime('2024-03-20T00:00:00Z'),
        validFrom: new DateTime('2024-03-20T00:00:00Z'),
        validUntil: '2024-03-21T00:00:00Z',
      },
      {
        signed: new DateTime('2024-03-20T00:00:00Z'),
        validFrom: new DateTime('2024-03-20T00:00:00Z'),
        validUntil: new DateTime('2024-03-21T00:00:00Z'),
        expectedUpdate: '2024-03-22T00:00:00Z',
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => validityInfoSchema.parse(input)).toThrow();
    });
  });
});
