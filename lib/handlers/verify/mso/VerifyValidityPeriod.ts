import { DateTime } from '../../../cbor';

/**
 * Type definition for verifying the validity period of an MSO (Mobile Station Operator).
 * @description
 * A function type that checks if the current time is within the validity period defined by
 * two DateTime objects: vaildFrom and validUntil.
 */
export type VerifyValidityPeriod = (
  vaildFrom: DateTime,
  validUntil: DateTime
) => Promise<void>;

/**
 * Verifies that the validity period of a given MSO (Mobile Station Operator) is valid.
 * The validity period is defined by two DateTime objects: vaildFrom and validUntil.
 * If the current time is outside this period, an error is thrown.
 *
 * @param {DateTime} vaildFrom - The start of the validity period.
 * @param {DateTime} validUntil - The end of the validity period.
 * @throws {Error} If the current time is not within the validity period.
 */
export const verifyValidityPeriod: VerifyValidityPeriod = async (
  vaildFrom: DateTime,
  validUntil: DateTime
) => {
  if (vaildFrom.getTime() === validUntil.getTime()) {
    return;
  }
  const now = Date.now();
  if (now < vaildFrom.getTime() || now > validUntil.getTime()) {
    throw new Error('Validity period is not valid');
  }
};
