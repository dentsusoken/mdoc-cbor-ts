import { createTag0 } from '@/cbor';
import { createValidityInfo, ValidityInfo } from '@/schemas/mso/ValidityInfo';

/**
 * Parameters for constructing the ValidityInfo section of a Mobile Security Object (MSO).
 *
 * @property signed         The date and time at which the MSO was signed (required).
 * @property validFrom      The date and time from which the document becomes valid (required).
 * @property validUntil     The date and time at which the document expires (required).
 * @property expectedUpdate The date and time by which the document should be updated (optional).
 */
type BuildValidityInfoParams = {
  signed: Date;
  validFrom: Date;
  validUntil: Date;
  expectedUpdate?: Date;
};

/**
 * Builds a ValidityInfo map for a Mobile Security Object (MSO) in the form expected by mDL standards.
 *
 * This function returns a ValidityInfo map containing canonical "signed", "validFrom", and "validUntil" fields,
 * and, if provided, an "expectedUpdate" field. All values are CBOR Tag(0) (tdate) objects wrapping normalized
 * RFC 3339 date-time strings (format: "YYYY-MM-DDTHH:MM:SSZ").
 *
 * The output structure is compatible with the expectations for MSO validityInfo in ISO 18013-5/7 (mDL) mobile document flows,
 * and can be used directly with downstream CBOR encoders, or with auth0/mdl's API.
 *
 * @param params
 *   The date and time values to use for MSO validity information.
 *   @param params.signed         Required. Date/time the MSO was signed.
 *   @param params.validFrom      Required. Date/time the document becomes valid.
 *   @param params.validUntil     Required. Date/time the document expires.
 *   @param params.expectedUpdate Optional. Date/time the document is expected to be updated.
 *
 * @returns {ReturnType<typeof createValidityInfo>}
 *   A ValidityInfo map with Tag(0) entries for the specified fields.
 *
 * @example
 * const validityInfo = buildValidityInfo({
 *   signed: new Date('2025-01-01T00:00:00Z'),
 *   validFrom: new Date('2025-01-01T00:00:00Z'),
 *   validUntil: new Date('2026-01-01T00:00:00Z'),
 *   expectedUpdate: new Date('2025-02-01T00:00:00Z')
 * });
 *
 * // Each entry is a Tag(0) (CBOR tdate) object containing an RFC 3339 string. For example:
 * // validityInfo.get('signed')?.tag === 0
 * // validityInfo.get('signed')?.value === '2025-01-01T00:00:00Z'
 */
export const buildValidityInfo = ({
  signed,
  validFrom,
  validUntil,
  expectedUpdate,
}: BuildValidityInfoParams): ValidityInfo => {
  const validityInfo = createValidityInfo();
  validityInfo.set('signed', createTag0(signed));
  validityInfo.set('validFrom', createTag0(validFrom));
  validityInfo.set('validUntil', createTag0(validUntil));

  if (expectedUpdate !== undefined) {
    validityInfo.set('expectedUpdate', createTag0(expectedUpdate));
  }

  return validityInfo;
};
