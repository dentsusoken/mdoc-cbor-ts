/**
 * Enumerates possible statuses for an mdoc.
 *
 * @enum {number}
 * @property {MDocStatus.OK} OK - Operation completed successfully.
 * @property {MDocStatus.GeneralError} GeneralError - A general or unspecified error occurred.
 * @property {MDocStatus.CborDecodingError} CborDecodingError - Error occurred while decoding CBOR data.
 * @property {MDocStatus.CborValidationError} CborValidationError - CBOR data failed schema or format validation.
 */
export enum MDocStatus {
  /** Operation completed successfully. */
  OK = 0,
  /** A general, unspecified error occurred. */
  GeneralError = 10,
  /** Failure decoding CBOR data. */
  CborDecodingError = 11,
  /** Failure validating CBOR against schema or specification. */
  CborValidationError = 12,
}

export enum MDocErrorCode {
  // XXX are errors that can be used at any level.
  // 1XXX are element-level errors.
  // 2XXX are document-level errors.

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
  /** NameSpaces are missing. */
  NameSpacesMissing = 2006,
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
