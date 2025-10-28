import { MDocErrorCode } from './types';

/**
 * Error representing an mdoc DocumentError.
 *
 * @description
 * Thrown when an mdoc flow reports a DocumentError in a DeviceResponse.
 * This class encapsulates the numeric error code and formats the message as
 * "<code> - <codeName>", where <codeName> is resolved from {@link MDocErrorCode}.
 *
 * ErrorCodeError is treated as the DocumentError of MDoc (DeviceResponse).
 */
export class ErrorCodeError extends Error {
  /**
   * The numeric mdoc error code associated with this error.
   */
  readonly errorCode: number;

  /**
   * Creates a new ErrorCodeError.
   *
   * @param errorCode - Numeric error code defined by the mdoc specification.
   */
  constructor(errorCode: number) {
    super(`${errorCode} - ${MDocErrorCode[errorCode]}`);

    this.errorCode = errorCode;
    this.name = 'ErrorCodeError';
  }
}
