import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { ValidityInfo } from '@/schemas/mso/ValidityInfo';

/**
 * Plain object representation for extracted validity information.
 *
 * @description
 * This object type contains the essential extracted values from a `ValidityInfo` structure:
 * - `signed`: The date/time when the MSO was signed (required).
 * - `validFrom`: The date/time when the document becomes valid (required).
 * - `validUntil`: The date/time when the document expires (required).
 * - `expectedUpdate`: The date/time by which the document should be updated (optional).
 *
 * All date values are converted from CBOR Tag(0) date-time strings to JavaScript `Date` objects.
 *
 * @property signed - The date/time when the MSO was signed, extracted from ValidityInfo.
 * @property validFrom - The date/time when the document becomes valid, extracted from ValidityInfo.
 * @property validUntil - The date/time when the document expires, extracted from ValidityInfo.
 * @property expectedUpdate - The optional date/time by which the document should be updated, extracted from ValidityInfo.
 *
 * @see ValidityInfo
 */
export interface ValidityInfoObject {
  /** The date/time when the MSO was signed, extracted from the ValidityInfo map. */
  signed: Date;
  /** The date/time when the document becomes valid, extracted from the ValidityInfo map. */
  validFrom: Date;
  /** The date/time when the document expires, extracted from the ValidityInfo map. */
  validUntil: Date;
  /** The optional date/time by which the document should be updated, extracted from the ValidityInfo map. */
  expectedUpdate?: Date;
}

/**
 * Converts a ValidityInfo Map structure to a plain object.
 *
 * @description
 * Extracts the `signed`, `validFrom`, `validUntil`, and optional `expectedUpdate` fields from a `ValidityInfo` Map
 * and returns them as a plain object with JavaScript `Date` instances. This function performs validation to ensure
 * all required fields are present in the input structure.
 *
 * Each field in `ValidityInfo` is stored as a CBOR Tag(0) containing an ISO 8601 date-time string.
 * This function extracts the string value from each Tag(0) and converts it to a JavaScript `Date` object.
 *
 * @param validityInfo - The ValidityInfo Map structure containing signed, validFrom, validUntil, and optional expectedUpdate.
 * @returns An object containing the extracted date values as JavaScript `Date` instances.
 *
 * @throws {ErrorCodeError}
 * Throws an error if `signed` is missing with code {@link MdocErrorCode.SignedMissing}.
 * Throws an error if `validFrom` is missing with code {@link MdocErrorCode.ValidFromMissing}.
 * Throws an error if `validUntil` is missing with code {@link MdocErrorCode.ValidUntilMissing}.
 *
 * @see {@link ValidityInfo}
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const validityInfo: ValidityInfo = new Map([
 *   ['signed', new Tag('2024-03-20T10:00:00Z', 0)],
 *   ['validFrom', new Tag('2024-03-20T10:00:00Z', 0)],
 *   ['validUntil', new Tag('2025-03-20T10:00:00Z', 0)],
 *   ['expectedUpdate', new Tag('2024-09-20T10:00:00Z', 0)],
 * ]);
 * const result = toValidityInfoObject(validityInfo);
 * // result.signed, result.validFrom, result.validUntil, and result.expectedUpdate are now Date objects
 * ```
 */
export const toValidityInfoObject = (
  validityInfo: ValidityInfo
): ValidityInfoObject => {
  const signed = validityInfo.get('signed');
  if (!signed) {
    throw new ErrorCodeError('Signed is missing', MdocErrorCode.SignedMissing);
  }

  const validFrom = validityInfo.get('validFrom');
  if (!validFrom) {
    throw new ErrorCodeError(
      'ValidFrom is missing',
      MdocErrorCode.ValidFromMissing
    );
  }

  const validUntil = validityInfo.get('validUntil');
  if (!validUntil) {
    throw new ErrorCodeError(
      'ValidUntil is missing',
      MdocErrorCode.ValidUntilMissing
    );
  }

  const expectedUpdate = validityInfo.get('expectedUpdate');

  return {
    signed: new Date(signed.value),
    validFrom: new Date(validFrom.value),
    validUntil: new Date(validUntil.value),
    expectedUpdate: expectedUpdate ? new Date(expectedUpdate.value) : undefined,
  };
};
