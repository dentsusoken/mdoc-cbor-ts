import { createTag0 } from '@/cbor';
import { ValidityInfo } from '@/schemas/mso/ValidityInfo';

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
 * Creates a `ValidityInfo` object with `signed`, `validFrom`, and `validUntil` timestamps
 * based on the provided durations. If an `expectedUpdate` duration is provided, it will
 * also include an `expectedUpdate` timestamp.
 *
 * All returned timestamp fields are CBOR Tag(0) values (tdate), whose `value` is a
 * normalized RFC 3339 date-time string in the `YYYY-MM-DDTHH:MM:SSZ` format.
 *
 * @param params - The parameters for building validity information
 * @param params.baseDate - Optional reference date to use for calculations. Defaults to current date/time if not provided
 * @param params.validFrom - Duration in milliseconds from the reference date until the document becomes valid
 * @param params.validUntil - Duration in milliseconds from the reference date until the document expires
 * @param params.expectedUpdate - Optional duration in milliseconds from the reference date until the document should be updated
 * @returns A `ValidityInfo` object with Tag(0) timestamps (`signed`, `validFrom`, `validUntil`, and optionally `expectedUpdate`)
 *
 * @example
 * ```typescript
 * const validityInfo = buildValidityInfo({
 *   baseDate: new Date('2025-01-01T00:00:00Z'),
 *   validFrom: 0, // Valid immediately
 *   validUntil: 365 * 24 * 60 * 60 * 1000, // Valid for 1 year
 *   expectedUpdate: 30 * 24 * 60 * 60 * 1000 // Update in 30 days
 * });
 *
 * // Each field is Tag(0); e.g.,
 * // validityInfo.signed.tag === 0
 * // typeof validityInfo.signed.value === 'string'
 * // validityInfo.signed.value === '2025-01-01T00:00:00Z'
 * ```
 */
export const buildValidityInfo = ({
  baseDate = new Date(),
  validFrom,
  validUntil,
  expectedUpdate,
}: BuildValidityInfoParams): ValidityInfo => {
  const validityInfo: ValidityInfo = {
    signed: createTag0(baseDate),
    validFrom: createTag0(new Date(baseDate.getTime() + validFrom)),
    validUntil: createTag0(new Date(baseDate.getTime() + validUntil)),
  };

  if (expectedUpdate !== undefined) {
    validityInfo.expectedUpdate = createTag0(
      new Date(baseDate.getTime() + expectedUpdate)
    );
  }

  return validityInfo;
};
