import { Errors } from '@/schemas/mdoc/Errors';

/**
 * Error representing a collection of errors organized by namespace.
 *
 * @description
 * Thrown when value digests verification or similar processes detect errors for one or more namespaces.
 * The {@link Errors} map contains per-namespace error details.
 *
 * @example
 * ```typescript
 * import { ErrorsError } from './ErrorsError';
 * import { Errors } from '@/schemas/mdoc/Errors';
 *
 * const errors: Errors = new Map([['org.iso.example', new Map([['claim', 1002]])]]);
 * throw new ErrorsError('There were errors during verification', errors);
 * ```
 */
export class ErrorsError extends Error {
  /**
   * The collection of errors mapped by namespace.
   */
  errors: Errors;

  /**
   * Constructs a new ErrorsError.
   * @param message - Description of the error.
   * @param errors - A map of errors by namespace.
   */
  constructor(message: string, errors: Errors) {
    super(message);
    this.errors = errors;
    this.name = 'ErrorsError';
  }
}
