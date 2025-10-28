import { MDocErrorCode } from './types';

/**
 * Error representing a single mdoc error code failure.
 *
 * @description
 * This error is thrown to signal an operation-specific mdoc error.
 * The error contains a numeric error code (from {@link MDocErrorCode}) and formats the message as:
 *   "<message> - <errorCode> - <enumName>"
 * where <message> is the provided message, <errorCode> is the numeric code, and <enumName> is the string name from the {@link MDocErrorCode} enum.
 *
 * @example
 * ```typescript
 * throw new ErrorCodeError('Failed to decode CBOR', MDocErrorCode.CborValidationError);
 * // Error message: "Failed to decode CBOR - 2 - CborValidationError"
 * ```
 */
export class ErrorCodeError extends Error {
  /**
   * The numeric mdoc error code associated with this error.
   */
  readonly errorCode: number;

  /**
   * Constructs a new ErrorCodeError.
   *
   * @param message - Human-readable description of the error condition.
   * @param errorCode - Numeric error code defined by the mdoc specification.
   */
  constructor(message: string, errorCode: number) {
    super(`${message} - ${errorCode} - ${MDocErrorCode[errorCode]}`);

    this.errorCode = errorCode;
    this.name = 'ErrorCodeError';
  }
}
