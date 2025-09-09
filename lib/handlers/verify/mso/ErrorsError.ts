import { Errors } from '@/schemas/error/Errors';

/**
 * Custom error class for handling MDOC validation errors
 * @description
 * Extends the standard Error class to include structured error information
 * from MDOC validation processes. This error type carries both a human-readable
 * message and detailed error mappings organized by namespace and data elements.
 *
 * @example
 * ```typescript
 * const errors = new Map([
 *   ['org.iso.18013.5.1', new Map([
 *     ['given_name', ErrorCode.required_claim_missing],
 *     ['age', ErrorCode.invalid_claim_format]
 *   ])]
 * ]);
 *
 * throw new ErrorsError('Validation failed', errors);
 * ```
 */
export class ErrorsError extends Error {
  /**
   * Structured error information organized by namespace and data elements
   * @description
   * Contains a map of namespaces to their respective error items, providing
   * detailed information about validation failures at the data element level.
   */
  errors: Errors;

  /**
   * Creates a new ErrorsError instance
   * @param message - Human-readable error message describing the validation failure
   * @param errors - Structured error information organized by namespace and data elements
   *
   * @example
   * ```typescript
   * const errors = new Map([
   *   ['org.iso.18013.5.1', new Map([['given_name', 2002]])]
   * ]);
   * const error = new ErrorsError('Document validation failed', errors);
   * ```
   */
  constructor(message: string, errors: Errors) {
    super(message);
    this.errors = errors;
    this.name = 'ErrorsError';
  }
}
