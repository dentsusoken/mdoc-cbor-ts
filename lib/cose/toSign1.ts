import { Tag } from 'cbor-x';
import { Sign1 } from './Sign1';
import { Sign1Tuple } from './Sign1';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { getTypeName } from '@/utils/getTypeName';

/**
 * Converts a CBOR Tag 18 (COSE_Sign1) to a Sign1 instance.
 *
 * @description
 * This function extracts the COSE_Sign1 structure from a CBOR Tag 18 and creates
 * a {@link Sign1} instance. The Tag 18 must contain a valid 4-tuple structure:
 * [protectedHeaders, unprotectedHeaders, payload, signature].
 *
 * @param tag18 - A CBOR Tag 18 instance containing a COSE_Sign1 structure.
 * @returns A {@link Sign1} instance created from the Tag 18 contents.
 *
 * @throws {ErrorCodeError}
 * Throws an error with code {@link MdocErrorCode.Sign1ConversionFailed} if:
 * - The input is not a Tag instance.
 * - The tag number is not 18.
 * - The tag value is not a valid Sign1Tuple (4-element array).
 * - Any element of the Sign1Tuple has an invalid type.
 *
 * @see {@link Sign1}
 * @see {@link Sign1Tuple}
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const tag18 = createTag18([
 *   protectedHeaders,
 *   unprotectedHeaders,
 *   payload,
 *   signature,
 * ]);
 * const sign1 = toSign1(tag18);
 * // sign1 is now a Sign1 instance that can be used for verification
 * ```
 */
export const toSign1 = (tag18: Tag): Sign1 => {
  if (!(tag18 instanceof Tag)) {
    throw new ErrorCodeError(
      'Input must be a Tag instance',
      MdocErrorCode.Sign1ConversionFailed
    );
  }

  if (tag18.tag !== 18) {
    throw new ErrorCodeError(
      `Expected Tag(18), but received Tag(${tag18.tag})`,
      MdocErrorCode.Sign1ConversionFailed
    );
  }

  const value = tag18.value;

  if (!Array.isArray(value)) {
    throw new ErrorCodeError(
      `Tag 18 value must be an array (Sign1Tuple), but received ${getTypeName(value)}`,
      MdocErrorCode.Sign1ConversionFailed
    );
  }

  if (value.length !== 4) {
    throw new ErrorCodeError(
      `Sign1Tuple must have 4 elements, but received ${value.length}`,
      MdocErrorCode.Sign1ConversionFailed
    );
  }

  const [protectedHeaders, unprotectedHeaders, payload, signature] =
    value as Sign1Tuple;

  // Validate types
  if (!(protectedHeaders instanceof Uint8Array)) {
    throw new ErrorCodeError(
      'Sign1Tuple[0] (protectedHeaders) must be a Uint8Array',
      MdocErrorCode.Sign1ConversionFailed
    );
  }

  if (!(unprotectedHeaders instanceof Map)) {
    throw new ErrorCodeError(
      'Sign1Tuple[1] (unprotectedHeaders) must be a Map',
      MdocErrorCode.Sign1ConversionFailed
    );
  }

  if (payload !== null && !(payload instanceof Uint8Array)) {
    throw new ErrorCodeError(
      'Sign1Tuple[2] (payload) must be a Uint8Array or null',
      MdocErrorCode.Sign1ConversionFailed
    );
  }

  if (!(signature instanceof Uint8Array)) {
    throw new ErrorCodeError(
      'Sign1Tuple[3] (signature) must be a Uint8Array',
      MdocErrorCode.Sign1ConversionFailed
    );
  }

  return new Sign1(protectedHeaders, unprotectedHeaders, payload, signature);
};
