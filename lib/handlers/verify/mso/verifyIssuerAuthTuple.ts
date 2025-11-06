import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { Sign1Tuple } from '@/cose/Sign1';
import { Sign1 } from '@/cose/Sign1';
import { JwkPublicKey } from '@/jwk/types';
import { getErrorMessage } from '@/utils/getErrorMessage';

/**
 * Verifies IssuerAuth COSE_Sign1 tuple and returns the payload.
 *
 * @description
 * Performs two validations for Issuer Authentication:
 * 1) Verifies the X.509 certificate chain (x5chain) from COSE headers and extracts the issuer public key.
 * 2) Verifies the COSE_Sign1 signature using the extracted public key.
 *
 * On failure, throws {@link ErrorCodeError} with the appropriate {@link MdocErrorCode} and a descriptive message.
 *
 * @param tuple - The COSE_Sign1 tuple `[protectedHeaders, unprotectedHeaders, payload, signature]`.
 * @param now - The current time used for certificate validity checks when verifying the x5chain.
 * @param clockSkew - Acceptable clock skew in seconds for certificate validity checks.
 * @returns The COSE payload as `Uint8Array` when verification succeeds.
 *
 * @throws {ErrorCodeError} If x5chain verification fails
 * with code {@link MdocErrorCode.X5ChainVerificationFailed} and message
 * `Failed to verify the X.509 certificate chain: <reason>`.
 *
 * @throws {ErrorCodeError} If the IssuerAuth signature verification fails
 * with code {@link MdocErrorCode.IssuerAuthSignatureVerificationFailed} and message
 * `Failed to verify the IssuerAuth signature: <reason>`.
 *
 * @throws {ErrorCodeError} If the COSE payload is null (detached payload required)
 * with code {@link MdocErrorCode.DetachedPayloadRequired} and message
 * `Detached payload is required when payload is null`.
 */
export const verifyIssuerAuthTuple = (
  [protectedHeaders, unprotectedHeaders, payload, signature]: Sign1Tuple,
  now: Date,
  clockSkew: number
): Uint8Array => {
  if (payload === null) {
    throw new ErrorCodeError(
      'Detached payload is required when payload is null',
      MdocErrorCode.DetachedPayloadRequired
    );
  }

  const sign1 = new Sign1(
    protectedHeaders,
    unprotectedHeaders,
    payload,
    signature
  );

  let publicKey: JwkPublicKey | undefined = undefined;
  try {
    publicKey = sign1.verifyX5Chain({ now, clockSkew });
  } catch (error) {
    throw new ErrorCodeError(
      `Failed to verify the X.509 certificate chain: ${getErrorMessage(error)}`,
      MdocErrorCode.X5ChainVerificationFailed
    );
  }

  try {
    sign1.verify(publicKey);
  } catch (error) {
    throw new ErrorCodeError(
      `Failed to verify the IssuerAuth signature: ${getErrorMessage(error)}`,
      MdocErrorCode.IssuerAuthSignatureVerificationFailed
    );
  }

  return payload;
};
