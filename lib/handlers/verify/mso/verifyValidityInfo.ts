import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MDocErrorCode } from '@/mdoc/types';
import { ValidityInfo } from '@/schemas/mso/ValidityInfo';

/**
 * Parameters for verifying document validity period.
 * @property validityInfo - The ValidityInfo object from the MSO.
 * @property now - The current time for validation (optional; defaults to current system time).
 * @property clockSkew - Acceptable clock skew in seconds (optional).
 * @description
 * clockSkewは秒単位です
 */
interface VerifyValidityInfoParams {
  validityInfo: ValidityInfo;
  now?: Date;
  /** Acceptable clock skew in seconds */
  clockSkew?: number;
}

/**
 * Verifies that a document is valid according to its validity period, allowing for clock skew.
 *
 * Checks that the current time (`now`) is no earlier than `validFrom` minus clockSkew,
 * and no later than `validUntil` plus clockSkew. Throws specific ErrorCodeError codes on failure:
 * - {@link MDocErrorCode.ValidFromMissing} if validFrom is not present.
 * - {@link MDocErrorCode.ValidUntilMissing} if validUntil is not present.
 * - {@link MDocErrorCode.DocumentNotValidYet} if document is not yet valid.
 * - {@link MDocErrorCode.DocumentExpired} if document validity has expired.
 *
 * @param {Object} params - Parameters for verification.
 * @param {ValidityInfo} params.validityInfo - The ValidityInfo object from the MSO.
 * @param {Date} [params.now=new Date()] - The time to consider as "now" (defaults to current system time).
 * @param {number} [params.clockSkew=60] - Acceptable clock skew, in seconds (default: 60).
 *
 * @throws {ErrorCodeError} If validity dates are missing, or time is not within the valid range.
 */
export const verifyValidityInfo = ({
  validityInfo,
  now = new Date(),
  clockSkew = 60,
}: VerifyValidityInfoParams): void => {
  const validFrom = validityInfo.get('validFrom');
  if (!validFrom) {
    throw new ErrorCodeError(
      'ValidFrom is missing',
      MDocErrorCode.ValidFromMissing
    );
  }

  const validUntil = validityInfo.get('validUntil');
  if (!validUntil) {
    throw new ErrorCodeError(
      'ValidUntil is missing',
      MDocErrorCode.ValidUntilMissing
    );
  }

  if (now.getTime() < new Date(validFrom.value).getTime() - clockSkew * 1000) {
    throw new ErrorCodeError(
      'Document is not valid yet',
      MDocErrorCode.DocumentNotValidYet
    );
  }

  if (now.getTime() > new Date(validUntil.value).getTime() + clockSkew * 1000) {
    throw new ErrorCodeError(
      'Document has expired',
      MDocErrorCode.DocumentExpired
    );
  }
};
