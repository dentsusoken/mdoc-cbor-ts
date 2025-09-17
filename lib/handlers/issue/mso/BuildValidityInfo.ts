import { ValidityInfo } from '@/schemas/mso/ValidityInfo';
import { toISODateTimeString } from '@/utils/toISODateTimeString';

/**
 * Parameters for building validity information for a Mobile Security Object (MSO).
 */
type BuildValidityInfoParams = {
  /** Duration in milliseconds from now until the document becomes valid */
  validFrom: number;
  /** Duration in milliseconds from now until the document expires */
  validUntil: number;
  /** Optional duration in milliseconds from now until the document should be updated */
  expectedUpdate?: number;
};

/**
 * Builds validity information for a Mobile Security Object (MSO).
 *
 * This function creates a ValidityInfo object with signed, validFrom, and validUntil timestamps
 * based on the current time plus the specified durations. If an expectedUpdate duration is provided,
 * it will also include an expectedUpdate timestamp.
 *
 * @param params - The parameters for building validity information
 * @param params.validFrom - Duration in milliseconds from now until the document becomes valid
 * @param params.validUntil - Duration in milliseconds from now until the document expires
 * @param params.expectedUpdate - Optional duration in milliseconds from now until the document should be updated
 * @returns A ValidityInfo object with ISO datetime strings for all timestamps
 *
 * @example
 * ```typescript
 * const validityInfo = buildValidityInfo({
 *   validFrom: 0, // Valid immediately
 *   validUntil: 365 * 24 * 60 * 60 * 1000, // Valid for 1 year
 *   expectedUpdate: 30 * 24 * 60 * 60 * 1000 // Update in 30 days
 * });
 * ```
 */
export const buildValidityInfo = ({
  validFrom,
  validUntil,
  expectedUpdate,
}: BuildValidityInfoParams): ValidityInfo => {
  const now = Date.now();

  const validityInfo: ValidityInfo = {
    signed: toISODateTimeString(new Date(now)),
    validFrom: toISODateTimeString(new Date(now + validFrom)),
    validUntil: toISODateTimeString(new Date(now + validUntil)),
  };

  if (expectedUpdate !== undefined) {
    validityInfo.expectedUpdate = toISODateTimeString(
      new Date(now + expectedUpdate)
    );
  }

  return validityInfo;
};
