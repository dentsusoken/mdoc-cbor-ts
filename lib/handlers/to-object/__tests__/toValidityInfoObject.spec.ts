import { describe, it, expect } from 'vitest';
import { toValidityInfoObject } from '../toValidityInfoObject';
import { createValidityInfo } from '@/schemas/mso/ValidityInfo';
import { createTag0 } from '@/cbor/createTag0';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';

describe('toValidityInfoObject', () => {
  it('should extract signed, validFrom, and validUntil from ValidityInfo', () => {
    const signed = new Date('2024-03-20T10:00:00Z');
    const validFrom = new Date('2024-03-20T10:00:00Z');
    const validUntil = new Date('2025-03-20T10:00:00Z');

    const validityInfo = createValidityInfo([
      ['signed', createTag0(signed)],
      ['validFrom', createTag0(validFrom)],
      ['validUntil', createTag0(validUntil)],
    ]);

    const result = toValidityInfoObject(validityInfo);

    expect(result.signed).toEqual(signed);
    expect(result.validFrom).toEqual(validFrom);
    expect(result.validUntil).toEqual(validUntil);
    expect(result.expectedUpdate).toBeUndefined();
  });

  it('should extract expectedUpdate when present', () => {
    const signed = new Date('2024-03-20T10:00:00Z');
    const validFrom = new Date('2024-03-20T10:00:00Z');
    const validUntil = new Date('2025-03-20T10:00:00Z');
    const expectedUpdate = new Date('2024-09-20T10:00:00Z');

    const validityInfo = createValidityInfo([
      ['signed', createTag0(signed)],
      ['validFrom', createTag0(validFrom)],
      ['validUntil', createTag0(validUntil)],
      ['expectedUpdate', createTag0(expectedUpdate)],
    ]);

    const result = toValidityInfoObject(validityInfo);

    expect(result.signed).toEqual(signed);
    expect(result.validFrom).toEqual(validFrom);
    expect(result.validUntil).toEqual(validUntil);
    expect(result.expectedUpdate).toEqual(expectedUpdate);
  });

  it('should throw ErrorCodeError when signed is missing', () => {
    const validFrom = new Date('2024-03-20T10:00:00Z');
    const validUntil = new Date('2025-03-20T10:00:00Z');

    const validityInfo = createValidityInfo([
      ['signed', createTag0(new Date('2024-03-20T10:00:00Z'))],
      ['validFrom', createTag0(validFrom)],
      ['validUntil', createTag0(validUntil)],
    ]);
    validityInfo.delete('signed');

    try {
      toValidityInfoObject(validityInfo);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.SignedMissing);
      expect(err.message).toBe(
        `Signed is missing - ${MdocErrorCode.SignedMissing} - SignedMissing`
      );
    }
  });

  it('should throw ErrorCodeError when validFrom is missing', () => {
    const signed = new Date('2024-03-20T10:00:00Z');
    const validUntil = new Date('2025-03-20T10:00:00Z');

    const validityInfo = createValidityInfo([
      ['signed', createTag0(signed)],
      ['validFrom', createTag0(new Date('2024-03-20T10:00:00Z'))],
      ['validUntil', createTag0(validUntil)],
    ]);
    validityInfo.delete('validFrom');

    try {
      toValidityInfoObject(validityInfo);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.ValidFromMissing);
      expect(err.message).toBe(
        `ValidFrom is missing - ${MdocErrorCode.ValidFromMissing} - ValidFromMissing`
      );
    }
  });

  it('should throw ErrorCodeError when validUntil is missing', () => {
    const signed = new Date('2024-03-20T10:00:00Z');
    const validFrom = new Date('2024-03-20T10:00:00Z');

    const validityInfo = createValidityInfo([
      ['signed', createTag0(signed)],
      ['validFrom', createTag0(validFrom)],
      ['validUntil', createTag0(new Date('2025-03-20T10:00:00Z'))],
    ]);
    validityInfo.delete('validUntil');

    try {
      toValidityInfoObject(validityInfo);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.ValidUntilMissing);
      expect(err.message).toBe(
        `ValidUntil is missing - ${MdocErrorCode.ValidUntilMissing} - ValidUntilMissing`
      );
    }
  });
});
