import { MdocErrorCode } from './types';

/**
 * Returns a human-readable error message for a given MdocErrorCode.
 *
 * @description
 * This function provides standardized error messages for each error code defined in {@link MdocErrorCode}.
 * The messages are consistent with those used throughout the codebase when throwing {@link ErrorCodeError}.
 *
 * @param errorCode - The error code from the {@link MdocErrorCode} enum.
 * @returns A human-readable error message string corresponding to the error code.
 *
 * @example
 * ```typescript
 * const message = getErrorCodeMessage(MdocErrorCode.DeviceNameSpacesMissing);
 * // Returns: "The device name spaces are missing."
 * ```
 *
 * @see {@link MdocErrorCode}
 * @see {@link ErrorCodeError}
 */
export const getErrorCodeMessage = (errorCode: MdocErrorCode): string => {
  switch (errorCode) {
    // General errors (0-99)
    case MdocErrorCode.DataNotReturned:
      return 'Data that was requested was not returned.';
    case MdocErrorCode.CborDecodingError:
      return 'Failure decoding CBOR data.';
    case MdocErrorCode.CborValidationError:
      return 'Failure validating CBOR against schema or specification.';

    // Document-level errors (2000-2999)
    case MdocErrorCode.ValueDigestsMissing:
      return 'Value digests are missing.';
    case MdocErrorCode.DocumentNotValidYet:
      return 'Document is not valid yet.';
    case MdocErrorCode.DocumentExpired:
      return 'Document has expired.';
    case MdocErrorCode.ValidFromMissing:
      return 'ValidFrom is missing.';
    case MdocErrorCode.ValidUntilMissing:
      return 'ValidUntil is missing.';
    case MdocErrorCode.IssuerNameSpacesMissing:
      return 'The issuer name spaces are missing.';
    case MdocErrorCode.IssuerAuthMissing:
      return 'The issuer authentication is missing.';
    case MdocErrorCode.IssuerAuthInvalid:
      return 'IssuerAuth is invalid.';
    case MdocErrorCode.X5ChainVerificationFailed:
      return 'Failed to verify the X.509 certificate chain.';
    case MdocErrorCode.IssuerAuthSignatureVerificationFailed:
      return 'Failed to verify the IssuerAuth signature.';
    case MdocErrorCode.IssuerAuthPayloadDecodingFailed:
      return 'Failed to decode the IssuerAuth payload.';
    case MdocErrorCode.MobileSecurityObjectInvalid:
      return 'MobileSecurityObject is invalid.';
    case MdocErrorCode.DetachedPayloadRequired:
      return 'Detached payload is required when payload is null.';
    case MdocErrorCode.InvalidInputDescriptorFieldPath:
      return 'Invalid input descriptor field path.';
    case MdocErrorCode.DocTypeMissing:
      return 'The document type is missing.';
    case MdocErrorCode.IssuerSignedMissing:
      return 'The issuer-signed structure is missing.';
    case MdocErrorCode.ClaimSetsPresentWhenClaimsAbsent:
      return 'Claim sets are present when claims are absent.';
    case MdocErrorCode.IssuerNameSpacesSelectionFailed:
      return 'Failed to select issuer name spaces.';
    case MdocErrorCode.IssuerSignedItemCborDecodingError:
      return 'Failed to cbor-decode the issuer-signed item.';
    case MdocErrorCode.IssuerSignedItemCborValidationError:
      return 'Failed to validate the issuer-signed item structure.';
    case MdocErrorCode.ValueDigestMissing:
      return 'Value digest is missing.';
    case MdocErrorCode.ValueDigestMismatch:
      return 'Value digest does not match the expected digest.';
    case MdocErrorCode.SignedMissing:
      return 'Signed is missing.';
    case MdocErrorCode.VersionMissing:
      return 'Version is missing.';
    case MdocErrorCode.DigestAlgorithmMissing:
      return 'Digest algorithm is missing.';
    case MdocErrorCode.DeviceKeyInfoMissing:
      return 'Device key info is missing.';
    case MdocErrorCode.ValidityInfoMissing:
      return 'Validity info is missing.';
    case MdocErrorCode.IssuerSignedVerificationFailed:
      return 'Failed to verify Issuer-Signed.';
    case MdocErrorCode.DeviceNameSpacesMissing:
      return 'The device name spaces are missing.';
    case MdocErrorCode.DeviceAuthMissing:
      return 'The device authentication is missing.';
    case MdocErrorCode.DeviceSignatureMissing:
      return 'The device signature is missing.';
    case MdocErrorCode.DeviceMacNotSupported:
      return 'The device MAC is not supported.';
    case MdocErrorCode.Sign1ConversionFailed:
      return 'Failed to convert Tag 18 to Sign1.';
    case MdocErrorCode.DeviceKeyMissing:
      return 'Device key is missing.';
    case MdocErrorCode.DeviceSignedMissing:
      return 'Device signed structure is missing.';
    case MdocErrorCode.ClaimPathInvalid:
      return 'Claim path is invalid.';
    case MdocErrorCode.ClaimNameSpaceMissing:
      return 'Claim name space is missing.';
    case MdocErrorCode.ClaimDataElementMissing:
      return 'Claim data element is missing.';
    default: {
      // TypeScript exhaustiveness check
      void errorCode as never;
      return `Unknown error code: ${errorCode}`;
    }
  }
};
