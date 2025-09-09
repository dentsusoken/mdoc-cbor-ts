import { z } from 'zod';
import { createIntSchema } from '@/schemas/common/Int';

/**
 * Error code constants for MDOC validation and processing
 * @description
 * Provides a comprehensive set of predefined error codes for various MDOC
 * validation scenarios. These constants can be used for consistent error
 * reporting across the system.
 *
 * Error code categories:
 * - 1000-1999: Cryptographic and trust validation errors
 * - 2000-2999: Document structure and content validation errors
 * - 3000-3999: Session and authentication errors
 * - 4000-4999: Device-related errors
 * - 5000-5999: Format and parsing errors
 *
 * @example
 * ```typescript
 * // Using predefined error codes
 * const error = ErrorCode.mso_digest_mismatch; // 1002
 * const trustError = ErrorCode.trust_chain_untrusted; // 1003
 * ```
 */
export const ErrorCode = {
  issuer_signature_invalid: 1001,
  mso_digest_mismatch: 1002,
  trust_chain_untrusted: 1003,
  certificate_expired: 1004,
  doc_expired: 1005,
  doc_not_yet_valid: 1006,
  doc_type_mismatch: 2001,
  required_claim_missing: 2002,
  claim_not_requested: 2003,
  namespace_not_requested: 2004,
  profile_mismatch: 2005,
  challenge_missing: 3001,
  challenge_mismatch: 3002,
  session_expired: 3003,
  origin_verification_failed: 3004,
  device_signature_invalid: 4001,
  device_key_unavailable: 4002,
  device_binding_failed: 4003,
  malformed_issuer_signed: 5001,
  malformed_device_signed: 5002,
  invalid_claim_format: 5003,
  unsupported_namespace: 5004,
  unsupported_algorithm: 5005,
  value_digests_missing_for_namespace: 5006,
  value_digests_missing_for_digest_id: 5007,
} as const;

/**
 * Schema for error codes in MDOC
 * @description
 * Validates a required integer (`int`) error code. This schema does NOT restrict
 * values to a fixed set, because error codes may vary by framework or deployment.
 * The `ErrorCode` constant above is provided as a convenience list but is not enforced.
 *
 * Validation rules:
 * - Requires a number type
 * - Requires an integer (no decimal places)
 * - Accepts any integer (negative, zero, positive). No value restriction is enforced
 *
 * ```cddl
 * ErrorCode = int
 * ```
 *
 * @example
 * ```typescript
 * // Valid (value exists in the convenience enum)
 * const a = errorCodeSchema.parse(ErrorCode.mso_digest_mismatch); // 1002
 *
 * // Also valid (value not listed in the convenience enum)
 * const b = errorCodeSchema.parse(9999); // 9999
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (not an integer)
 * // Message: "ErrorCode: Please provide an integer (no decimal places)"
 * errorCodeSchema.parse(1.5);
 * ```
 *
 * @see createIntSchema
 */
export const errorCodeSchema = createIntSchema('ErrorCode');

/**
 * Type definition for error codes
 * @description
 * Represents a validated integer error code value
 *
 * ```cddl
 * ErrorCode = int
 * ```
 */
export type ErrorCode = z.output<typeof errorCodeSchema>;
