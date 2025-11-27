/**
 * Enumerates possible statuses for an mdoc.
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
 * - 1000–1999: Element-level errors (e.g., value digests, MSO). **Not currently implemented.**
 * - 2000–2999: Document-level errors (e.g., document validity, namespaces).
 * - Other groups (3000+): Session, device, format, or protocol-specific errors.
 *
 * @enum {number}
 */
export enum MdocErrorCode {
  /** Data that was requested was not returned. */
  DataNotReturned = 0,
  /** Failure decoding CBOR data. */
  CborDecodingError = 1,
  /** Failure validating CBOR against schema or specification. */
  CborValidationError = 2,

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
  /** Failed to cbor-decode the issuer-signed item. */
  IssuerSignedItemCborDecodingError = 2019,
  /** Failed to validate the issuer-signed item structure. */
  IssuerSignedItemCborValidationError = 2020,
  /** Value digest is missing. */
  ValueDigestMissing = 2021,
  /** Value digest does not match the expected digest. */
  ValueDigestMismatch = 2022,
  /** Signed is missing. */
  SignedMissing = 2023,
  /** Version is missing. */
  VersionMissing = 2024,
  /** Digest algorithm is missing. */
  DigestAlgorithmMissing = 2025,
  /** Device key info is missing. */
  DeviceKeyInfoMissing = 2026,
  /** Validity info is missing. */
  ValidityInfoMissing = 2027,
  /** Failed to verify Issuer-Signed */
  IssuerSignedVerificationFailed = 2028,
  /** Device name spaces are missing. */
  DeviceNameSpacesMissing = 2029,
  /** Device auth is missing. */
  DeviceAuthMissing = 2030,
  /** Device signature is missing. */
  DeviceSignatureMissing = 2031,
  /** Device MAC is not supported. */
  DeviceMacNotSupported = 2032,
  /** Failed to convert Tag 18 to Sign1. */
  Sign1ConversionFailed = 2033,
  /** Device key is missing. */
  DeviceKeyMissing = 2034,
  /** Device signed structure is missing. */
  DeviceSignedMissing = 2035,
}

/**
 * Represents the session transcript structure used in mdoc DeviceAuthentication.
 *
 * The session transcript is a tuple:
 *   [DeviceEngagementBytes, EReaderKeyBytes, Handover]
 *
 * - DeviceEngagementBytes: CBOR-encoded or raw bytes for Device Engagement, or null if not present.
 * - EReaderKeyBytes: CBOR-encoded or raw bytes for eReader ephemeral key, or null if not present.
 * - Handover: Additional handover structure, type varies by protocol, may be a Map or array.
 *
 * @see ISO/IEC 18013-5 section 9.1.4
 * @example
 * const transcript: SessionTranscript = [null, null, new Map([['handoverType', 1]])];
 */
export type SessionTranscript = [Uint8Array | null, Uint8Array | null, unknown];
