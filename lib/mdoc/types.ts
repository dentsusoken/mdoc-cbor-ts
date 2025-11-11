/**
 * Enumerates possible statuses for an mdoc.
 *
 * @enum {number}
 * @property {MDocStatus.OK} OK - Operation completed successfully.
 * @property {MDocStatus.GeneralError} GeneralError - A general or unspecified error occurred.
 * @property {MDocStatus.CborDecodingError} CborDecodingError - Error occurred while decoding CBOR data.
 * @property {MDocStatus.CborValidationError} CborValidationError - CBOR data failed schema or format validation.
 */
export enum MdocStatus {
  /** Operation completed successfully. */
  OK = 0,
  /** A general, unspecified error occurred. */
  GeneralError = 10,
  /** Failure decoding CBOR data. */
  CborDecodingError = 11,
  /** Failure validating CBOR against schema or specification. */
  CborValidationError = 12,
}

/**
 * Enumerates error codes for mdoc operations, categorized by context.
 *
 * Codes are grouped as follows:
 * - 0–99: General errors (can occur at any level).
 * - 1000–1999: Element-level errors (e.g., value digests, MSO).
 * - 2000–2999: Document-level errors (e.g., document validity, namespaces).
 * - Other groups (3000+): Session, device, format, or protocol-specific errors.
 *
 * @enum {number}
 *
 * @property {MdocErrorCode.DataNotReturned} DataNotReturned - Data that was requested was not returned.
 * @property {MdocErrorCode.CborDecodingError} CborDecodingError - Failure decoding CBOR data.
 * @property {MdocErrorCode.CborValidationError} CborValidationError - Failure validating CBOR against schema or specification.
 *
 * Element-level errors (1000–1999):
 * @property {MdocErrorCode.ValueDigestMissing} ValueDigestMissing - Value digest is missing.
 * @property {MdocErrorCode.MsoDigestMismatch} MsoDigestMismatch - The Mobile Security Object digest does not match.
 *
 * Document-level errors (2000–2999):
 * @property {MdocErrorCode.ValueDigestsMissing} ValueDigestsMissing - Value digests are missing.
 * @property {MdocErrorCode.DocumentNotValidYet} DocumentNotValidYet - Document is not valid yet.
 * @property {MdocErrorCode.DocumentExpired} DocumentExpired - Document has expired.
 * @property {MdocErrorCode.ValidFromMissing} ValidFromMissing - ValidFrom is missing.
 * @property {MdocErrorCode.ValidUntilMissing} ValidUntilMissing - ValidUntil is missing.
 * @property {MdocErrorCode.NameSpacesMissing} NameSpacesMissing - NameSpaces are missing.
 * @property {MdocErrorCode.IssuerAuthMissing} IssuerAuthMissing - IssuerAuth is missing.
 * @property {MdocErrorCode.IssuerAuthInvalid} IssuerAuthInvalid - IssuerAuth is invalid.
 * @property {MdocErrorCode.X5ChainVerificationFailed} X5ChainVerificationFailed - Failed to verify the X.509 certificate chain.
 * @property {MdocErrorCode.IssuerAuthSignatureVerificationFailed} IssuerAuthSignatureVerificationFailed - Failed to verify the IssuerAuth signature.
 * @property {MdocErrorCode.IssuerAuthPayloadDecodingFailed} IssuerAuthPayloadDecodingFailed - Failed to decode the IssuerAuth payload.
 * @property {MdocErrorCode.MobileSecurityObjectInvalid} MobileSecurityObjectInvalid - MobileSecurityObject is invalid.
 * @property {MdocErrorCode.DetachedPayloadRequired} DetachedPayloadRequired - Detached payload is required when payload is null.
 * @property {MdocErrorCode.InvalidInputDescriptorFieldPath} InvalidInputDescriptorFieldPath - Invalid input descriptor field path.
 *
 * Additional document/claim errors:
 * @property {MdocErrorCode.DocTypeMismatch} DocTypeMismatch - The document type does not match the expected type.
 * @property {MdocErrorCode.RequiredClaimMissing} RequiredClaimMissing - A required claim is missing in the document.
 * @property {MdocErrorCode.ClaimNotRequested} ClaimNotRequested - A claim was provided but not requested.
 * @property {MdocErrorCode.NamespaceNotRequested} NamespaceNotRequested - A name space was provided but not requested.
 * @property {MdocErrorCode.ProfileMismatch} ProfileMismatch - The document's profile does not match the expected.
 *
 * Session-level errors (3000–3999):
 * @property {MdocErrorCode.ChallengeMissing} ChallengeMissing - The session challenge is missing.
 * @property {MdocErrorCode.ChallengeMismatch} ChallengeMismatch - The session challenge does not match.
 * @property {MdocErrorCode.SessionExpired} SessionExpired - The session has expired.
 * @property {MdocErrorCode.OriginVerificationFailed} OriginVerificationFailed - Could not verify the origin of the session.
 *
 * Device-level/protocol errors (4000+):
 * @property {MdocErrorCode.DeviceSignatureInvalid} DeviceSignatureInvalid - The device signature is invalid.
 * @property {MdocErrorCode.DeviceKeyUnavailable} DeviceKeyUnavailable - The device key is unavailable.
 * @property {MdocErrorCode.DeviceBindingFailed} DeviceBindingFailed - Device binding has failed.
 * @property {MdocErrorCode.MalformedIssuerSigned} MalformedIssuerSigned - IssuerSigned structure is malformed.
 * @property {MdocErrorCode.MalformedDeviceSigned} MalformedDeviceSigned - DeviceSigned structure is malformed.
 * @property {MdocErrorCode.InvalidClaimFormat} InvalidClaimFormat - A claim is formatted incorrectly.
 * @property {MdocErrorCode.UnsupportedNamespace} UnsupportedNamespace - A namespace is not supported.
 * @property {MdocErrorCode.UnsupportedAlgorithm} UnsupportedAlgorithm - A cryptographic algorithm is not supported.
 */
export enum MdocErrorCode {
  /** Data that was requested was not returned. */
  DataNotReturned = 0,
  /** Failure decoding CBOR data. */
  CborDecodingError = 1,
  /** Failure validating CBOR against schema or specification. */
  CborValidationError = 2,

  // 1XXX are element-level errors.
  /** Value digest is missing. */
  ValueDigestMissing = 1001,
  /** The Mobile Security Object digest does not match. */
  MsoDigestMismatch = 1002,

  // 2XXX are document-level errors.
  /** Value digests are missing. */
  ValueDigestsMissing = 2001,
  /** Document is not valid yet */
  DocumentNotValidYet = 2002,
  /** Document has expired */
  DocumentExpired = 2003,
  /** ValidFrom is missing. */
  ValidFromMissing = 2004,
  /** ValidUntil is missing. */
  ValidUntilMissing = 2005,
  /** Issuer name spaces are missing. */
  IssuerNameSpacesMissing = 2006,
  /** IssuerAuth is missing. */
  IssuerAuthMissing = 2007,
  /** IssuerAuth is invalid. */
  IssuerAuthInvalid = 2008,
  /** Failed to verify the X.509 certificate chain. */
  X5ChainVerificationFailed = 2009,
  /** Failed to verify the IssuerAuth signature. */
  IssuerAuthSignatureVerificationFailed = 2010,
  /** Failed to decode the IssuerAuth payload. */
  IssuerAuthPayloadDecodingFailed = 2011,
  /** MobileSecurityObject is invalid. */
  MobileSecurityObjectInvalid = 2012,
  /** Detached payload is required when payload is null. */
  DetachedPayloadRequired = 2013,
  /** Invalid input descriptor field path. */
  InvalidInputDescriptorFieldPath = 2014,
  /** The document type is missing. */
  DocTypeMissing = 2015,
  /** The issuer-signed structure is missing. */
  IssuerSignedMissing = 2016,
  /** Claim sets are present when claims are absent. */
  ClaimSetsPresentWhenClaimsAbsent = 2017,
  /** Failed to select issuer name spaces. */
  IssuerNameSpacesSelectionFailed = 2018,

  /** The document type does not match the expected type. */
  DocTypeMismatch = 12001,
  /** A required claim is missing in the document. */
  RequiredClaimMissing = 12002,
  /** A claim was provided but not requested. */
  ClaimNotRequested = 12003,
  /** A name space was provided but not requested. */
  NamespaceNotRequested = 22004,
  /** The document's profile does not match the expected. */
  ProfileMismatch = 22005,
  /** The session challenge is missing. */
  ChallengeMissing = 3001,
  /** The session challenge does not match. */
  ChallengeMismatch = 3002,
  /** The session has expired. */
  SessionExpired = 3003,
  /** Could not verify the origin of the session. */
  OriginVerificationFailed = 3004,
  /** The device signature is invalid. */
  DeviceSignatureInvalid = 4001,
  /** The device key is unavailable. */
  DeviceKeyUnavailable = 4002,
  /** Device binding has failed. */
  DeviceBindingFailed = 4003,
  /** IssuerSigned structure is malformed. */
  MalformedIssuerSigned = 5001,
  /** DeviceSigned structure is malformed. */
  MalformedDeviceSigned = 5002,
  /** A claim is formatted incorrectly. */
  InvalidClaimFormat = 5003,
  /** A namespace is not supported. */
  UnsupportedNamespace = 5004,
  /** A cryptographic algorithm is not supported. */
  UnsupportedAlgorithm = 5005,
}
