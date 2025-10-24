import { MDocErrorCode } from './types';

/**
 * Error for issues associated with a specific MDOC NameSpace.
 *
 * @description
 * Thrown when an operation fails for a given NameSpace, providing a structured
 * way to include the relevant NameSpace string and error code.
 *
 * @example
 * ```typescript
 * throw new NameSpaceError('org.iso.18013.5.1', 2001);
 * ```
 */
export class NameSpaceError extends Error {
  /**
   * The affected NameSpace string.
   */
  readonly nameSpace: string;

  /**
   * The specific error code associated with the NameSpace.
   */
  readonly errorCode: number;

  /**
   * Constructs a new NameSpaceError instance.
   * @param nameSpace - The namespace in which the error occurred.
   * @param errorCode - The error code describing the issue.
   */
  constructor(nameSpace: string, errorCode: number) {
    super(`${nameSpace} - ${errorCode} - ${MDocErrorCode[errorCode]}`);

    this.nameSpace = nameSpace;
    this.errorCode = errorCode;
    this.name = 'NameSpaceError';
  }
}
