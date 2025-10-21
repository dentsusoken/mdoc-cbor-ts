/**
 * Enumeration for mdoc status codes.
 *
 * @description
 * Represents the set of possible status codes that an mdoc (mobile document) can have,
 * describing its current validity or error state.
 *
 * - {@link MDocStatus.Valid} (0): The document is valid and active.
 * - {@link MDocStatus.Suspended} (10): The document is suspended.
 * - {@link MDocStatus.Revoked} (11): The document has been revoked.
 * - {@link MDocStatus.Expired} (12): The document has expired.
 *
 * @example
 * ```typescript
 * const status: MDocStatus = MDocStatus.Valid;
 * if (status === MDocStatus.Revoked) {
 *   // handle revoked document
 * }
 * ```
 */
export enum MDocStatus {
  /** The document is valid and active. */
  Valid = 0,
  /** The document is suspended. */
  Suspended = 10,
  /** The document has been revoked. */
  Revoked = 11,
  /** The document has expired. */
  Expired = 12,
}

/**
 * Enumeration of standardized error codes for mdoc processing and validation.
 *
 * @description
 * These codes represent well-defined error scenarios that can occur during the
 * lifecycle of mobile document (mdoc) issuance, verification, and usage flows.
 * They allow for consistent error identification and handling in libraries and applications.
 *
 * | Error Code | Name                                 | Description                                            |
 * |----------- |--------------------------------------|--------------------------------------------------------|
 * | 1001       | IssuerSignatureInvalid               | The issuer signature is invalid                        |
 * | 1002       | MsoDigestMismatch                    | The Mobile Security Object digest does not match       |
 * | 1003       | TrustChainUntrusted                  | The trust chain is untrusted or cannot be verified     |
 * | 1004       | CertificateExpired                   | The certificate has expired                            |
 * | 1005       | DocExpired                           | The document has expired                               |
 * | 1006       | DocNotYetValid                       | The document is not yet valid                          |
 * | 2001       | DocTypeMismatch                      | The document type does not match the expected type     |
 * | 2002       | RequiredClaimMissing                 | A required claim is missing in the document            |
 * | 2003       | ClaimNotRequested                    | A claim was provided but not requested                 |
 * | 2004       | NamespaceNotRequested                | A name space was provided but not requested            |
 * | 2005       | ProfileMismatch                      | The document's profile does not match the expected     |
 * | 3001       | ChallengeMissing                     | The session challenge is missing                       |
 * | 3002       | ChallengeMismatch                    | The session challenge does not match                   |
 * | 3003       | SessionExpired                       | The session has expired                                |
 * | 3004       | OriginVerificationFailed             | Could not verify the origin of the session             |
 * | 4001       | DeviceSignatureInvalid               | The device signature is invalid                        |
 * | 4002       | DeviceKeyUnavailable                 | The device key is unavailable                          |
 * | 4003       | DeviceBindingFailed                  | Device binding has failed                              |
 * | 5001       | MalformedIssuerSigned                | IssuerSigned structure is malformed                    |
 * | 5002       | MalformedDeviceSigned                | DeviceSigned structure is malformed                    |
 * | 5003       | InvalidClaimFormat                   | A claim is formatted incorrectly                       |
 * | 5004       | UnsupportedNamespace                 | A namespace is not supported                           |
 * | 5005       | UnsupportedAlgorithm                 | A cryptographic algorithm is not supported             |
 * | 5006       | ValueDigestsMissingForNamespace      | Value digests are missing for a namespace              |
 * | 5007       | ValueDigestsMissingForDigestId       | Value digests are missing for a digest ID              |
 *
 * @example
 * ```typescript
 * // Using an error code from the enum
 * const err: MDocErrorCode = MDocErrorCode.IssuerSignatureInvalid;
 * if (err === MDocErrorCode.SessionExpired) {
 *   // Handle session expiration
 * }
 * ```
 */
export enum MDocErrorCode {
  /** The issuer signature is invalid. */
  IssuerSignatureInvalid = 1001,
  /** The Mobile Security Object digest does not match. */
  MsoDigestMismatch = 1002,
  /** The trust chain is untrusted or cannot be verified. */
  TrustChainUntrusted = 1003,
  /** The certificate has expired. */
  CertificateExpired = 1004,
  /** The document has expired. */
  DocExpired = 1005,
  /** The document is not yet valid. */
  DocNotYetValid = 1006,
  /** The document type does not match the expected type. */
  DocTypeMismatch = 2001,
  /** A required claim is missing in the document. */
  RequiredClaimMissing = 2002,
  /** A claim was provided but not requested. */
  ClaimNotRequested = 2003,
  /** A name space was provided but not requested. */
  NamespaceNotRequested = 2004,
  /** The document's profile does not match the expected. */
  ProfileMismatch = 2005,
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
  /** Value digests are missing for a namespace. */
  ValueDigestsMissingForNamespace = 5006,
  /** Value digests are missing for a digest ID. */
  ValueDigestsMissingForDigestId = 5007,
}
