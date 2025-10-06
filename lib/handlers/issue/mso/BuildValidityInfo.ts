import { createTag0 } from '@/cbor';
import { ValidityInfo } from '@/schemas/mso/ValidityInfo';

/**
 * Parameters for building validity information for a Mobile Security Object (MSO).
 */
type BuildValidityInfoParams = {
  /** The date and time when the MSO was signed */
  signed: Date;
  /** The date and time when the document becomes valid */
  validFrom: Date;
  /** The date and time when the document expires */
  validUntil: Date;
  /** Optional date and time when the document should be updated */
  expectedUpdate?: Date;
};

/**
 * Builds validity information for a Mobile Security Object (MSO).
 *
 * Creates a `ValidityInfo` object with `signed`, `validFrom`, and `validUntil` timestamps
 * based on the provided dates. If an `expectedUpdate` date is provided, it will
 * also include an `expectedUpdate` timestamp.
 *
 * All returned timestamp fields are CBOR Tag(0) values (tdate), whose `value` is a
 * normalized RFC 3339 date-time string in the `YYYY-MM-DDTHH:MM:SSZ` format.
 *
 * This API is compatible with auth0/mdl's `addValidityInfo` method.
 *
 * @param params - The parameters for building validity information
 * @param params.signed - The date and time when the MSO was signed
 * @param params.validFrom - The date and time when the document becomes valid
 * @param params.validUntil - The date and time when the document expires
 * @param params.expectedUpdate - Optional date and time when the document should be updated
 * @returns A `ValidityInfo` object with Tag(0) timestamps (`signed`, `validFrom`, `validUntil`, and optionally `expectedUpdate`)
 *
 * @example
 * ```typescript
 * const validityInfo = buildValidityInfo({
 *   signed: new Date('2025-01-01T00:00:00Z'),
 *   validFrom: new Date('2025-01-01T00:00:00Z'), // Valid immediately
 *   validUntil: new Date('2026-01-01T00:00:00Z'), // Valid for 1 year
 *   expectedUpdate: new Date('2025-02-01T00:00:00Z') // Update in 1 month
 * });
 *
 * // Each field is Tag(0); e.g.,
 * // validityInfo.signed.tag === 0
 * // typeof validityInfo.signed.value === 'string'
 * // validityInfo.signed.value === '2025-01-01T00:00:00Z'
 * ```
 */
export const buildValidityInfo = ({
  signed,
  validFrom,
  validUntil,
  expectedUpdate,
}: BuildValidityInfoParams): ValidityInfo => {
  const validityInfo: ValidityInfo = {
    signed: createTag0(signed),
    validFrom: createTag0(validFrom),
    validUntil: createTag0(validUntil),
  };

  if (expectedUpdate !== undefined) {
    validityInfo.expectedUpdate = createTag0(expectedUpdate);
  }

  return validityInfo;
};
