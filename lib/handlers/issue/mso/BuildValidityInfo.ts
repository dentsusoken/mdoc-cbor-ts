import { ValidityInfo } from '@/schemas/mso/ValidityInfo';
import { toISODateTimeString } from '@/utils/toISODateTimeString';

/**
 * Parameters for building validity information for a Mobile Security Object (MSO).
 */
type BuildValidityInfoParams = {
  /** Optional reference date to use for calculations. Defaults to current date/time if not provided */
  baseDate?: Date;
  /** Duration in milliseconds from the reference date until the document becomes valid */
  validFrom: number;
  /** Duration in milliseconds from the reference date until the document expires */
  validUntil: number;
  /** Optional duration in milliseconds from the reference date until the document should be updated */
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
 * @param params.baseDate - Optional reference date to use for calculations. Defaults to current date/time if not provided
 * @param params.validFrom - Duration in milliseconds from the reference date until the document becomes valid
 * @param params.validUntil - Duration in milliseconds from the reference date until the document expires
 * @param params.expectedUpdate - Optional duration in milliseconds from the reference date until the document should be updated
 * @returns A ValidityInfo object with ISO datetime strings for all timestamps
 *
 * @example
 * ```typescript
 * const validityInfo = buildValidityInfo({
 *   baseDate: new Date('2025-01-01T00:00:00Z'),
 *   validFrom: 0, // Valid immediately
 *   validUntil: 365 * 24 * 60 * 60 * 1000, // Valid for 1 year
 *   expectedUpdate: 30 * 24 * 60 * 60 * 1000 // Update in 30 days
 * });
 * ```
 */
export const buildValidityInfo = ({
  baseDate = new Date(),
  validFrom,
  validUntil,
  expectedUpdate,
}: BuildValidityInfoParams): ValidityInfo => {
  const validityInfo: ValidityInfo = {
    signed: toISODateTimeString(baseDate),
    validFrom: toISODateTimeString(new Date(baseDate.getTime() + validFrom)),
    validUntil: toISODateTimeString(new Date(baseDate.getTime() + validUntil)),
  };

  if (expectedUpdate !== undefined) {
    validityInfo.expectedUpdate = toISODateTimeString(
      new Date(baseDate.getTime() + expectedUpdate)
    );
  }

  return validityInfo;
};
