import { describe, it, expect } from 'vitest';
import { verifyValidityInfo } from '../verifyValidityInfo';
import { createTag0 } from '@/cbor/createTag0';
import { MDocErrorCode } from '@/mdoc/types';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { ValidityInfo } from '@/schemas/mso/ValidityInfo';

const makeValidity = (
  from: Date,
  until: Date,
  signed: Date = from
): ValidityInfo => {
  return new Map<string, unknown>([
    ['signed', createTag0(signed)],
    ['validFrom', createTag0(from)],
    ['validUntil', createTag0(until)],
  ]) as unknown as ValidityInfo;
};

describe('verifyValidityInfo', () => {
  describe('success cases', () => {
    it('passes when now is within [validFrom - skew, validUntil + skew]', () => {
      const now = new Date();
      const from = new Date(now.getTime() - 60_000);
      const until = new Date(now.getTime() + 60_000);
      const vi = makeValidity(from, until);
      expect(() => verifyValidityInfo({ validityInfo: vi, now })).not.toThrow();
    });

    it('does not throw when within skew before validFrom', () => {
      const now = new Date();
      const from = new Date(now.getTime() + 30_000); // 30s ahead, default skew 60s
      const until = new Date(now.getTime() + 10 * 60_000);
      const vi = makeValidity(from, until);
      expect(() => verifyValidityInfo({ validityInfo: vi, now })).not.toThrow();
    });

    it('does not throw when within skew after validUntil', () => {
      const now = new Date();
      const from = new Date(now.getTime() - 10 * 60_000);
      const until = new Date(now.getTime() - 30_000); // 30s past, default skew 60s
      const vi = makeValidity(from, until);
      expect(() => verifyValidityInfo({ validityInfo: vi, now })).not.toThrow();
    });
  });

  describe('error cases', () => {
    it('throws when validFrom is missing', () => {
      const now = new Date();
      const until = new Date(now.getTime() + 60_000);
      const vi = new Map<string, unknown>([
        ['signed', createTag0(now)],
        ['validUntil', createTag0(until)],
      ]) as unknown as ValidityInfo;

      try {
        verifyValidityInfo({ validityInfo: vi, now });
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MDocErrorCode.ValidFromMissing);
        expect(err.message).toBe(
          'ValidFrom is missing - 2004 - ValidFromMissing'
        );
      }
    });

    it('throws when validUntil is missing', () => {
      const now = new Date();
      const from = new Date(now.getTime() - 60_000);
      const vi = new Map<string, unknown>([
        ['signed', createTag0(now)],
        ['validFrom', createTag0(from)],
      ]) as unknown as ValidityInfo;

      try {
        verifyValidityInfo({ validityInfo: vi, now });
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MDocErrorCode.ValidUntilMissing);
        expect(err.message).toBe(
          'ValidUntil is missing - 2005 - ValidUntilMissing'
        );
      }
    });

    it('throws DocumentNotValidYet when now is before validFrom beyond skew', () => {
      const now = new Date();
      const from = new Date(now.getTime() + 5 * 60_000); // 5 minutes in future
      const until = new Date(now.getTime() + 10 * 60_000);
      const vi = makeValidity(from, until);

      try {
        verifyValidityInfo({ validityInfo: vi, now });
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MDocErrorCode.DocumentNotValidYet);
        expect(err.message).toBe(
          'Document is not valid yet - 2002 - DocumentNotValidYet'
        );
      }
    });

    it('throws DocumentExpired when now is after validUntil beyond skew', () => {
      const now = new Date();
      const from = new Date(now.getTime() - 10 * 60_000);
      const until = new Date(now.getTime() - 5 * 60_000); // 5 minutes in past
      const vi = makeValidity(from, until);

      try {
        verifyValidityInfo({ validityInfo: vi, now });
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MDocErrorCode.DocumentExpired);
        expect(err.message).toBe(
          'Document has expired - 2003 - DocumentExpired'
        );
      }
    });
  });
});
