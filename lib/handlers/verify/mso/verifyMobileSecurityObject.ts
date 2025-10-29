import { decodeCbor } from '@/cbor/codec';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MDocErrorCode } from '@/mdoc/types';
import {
  MobileSecurityObject,
  mobileSecurityObjectSchema,
} from '@/schemas/mso/MobileSecurityObject';
import { getErrorMessage } from '@/utils/getErrorMessage';

/**
 * Decodes and validates a Mobile Security Object (MSO) from a CBOR-encoded payload.
 *
 * @description
 * This function takes a CBOR-encoded Uint8Array payload, decodes it,
 * and validates it against the MobileSecurityObject schema. It throws detailed errors
 * on either CBOR decoding failure or schema validation failure, each tagged with
 * an appropriate {@link MDocErrorCode}.
 *
 * @param payload - The CBOR-encoded MSO as a Uint8Array.
 * @returns The validated {@link MobileSecurityObject} instance.
 *
 * @throws {ErrorCodeError} If decoding the payload fails,
 *         with code {@link MDocErrorCode.IssuerAuthPayloadDecodingFailed} and an explanatory message.
 * @throws {ErrorCodeError} If the MSO fails schema validation,
 *         with code {@link MDocErrorCode.MobileSecurityObjectInvalid} and an explanatory message.
 */
export const verifyMobileSecurityObject = (
  payload: Uint8Array
): MobileSecurityObject => {
  let decodedPayload: unknown | undefined = undefined;
  try {
    decodedPayload = decodeCbor(payload);
  } catch (error) {
    throw new ErrorCodeError(
      `Failed to decode the IssuerAuth payload: ${getErrorMessage(error)}`,
      MDocErrorCode.IssuerAuthPayloadDecodingFailed
    );
  }

  const msoResult = mobileSecurityObjectSchema.safeParse(decodedPayload);
  if (!msoResult.success) {
    throw new ErrorCodeError(
      `MobileSecurityObject is invalid: ${msoResult.error.message}`,
      MDocErrorCode.MobileSecurityObjectInvalid
    );
  }

  return msoResult.data as MobileSecurityObject;
};
