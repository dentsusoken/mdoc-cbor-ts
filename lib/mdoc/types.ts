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
