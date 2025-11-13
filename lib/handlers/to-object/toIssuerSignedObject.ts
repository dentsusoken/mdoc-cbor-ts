import { IssuerAuth } from '@/schemas/mso/IssuerAuth';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { IssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';

/**
 * Result object containing extracted issuer-signed nameSpaces and issuerAuth.
 */
interface ToIssuerSignedObjectResult {
  /** The issuer-signed nameSpaces extracted from IssuerSigned. */
  nameSpaces: IssuerNameSpaces;
  /** The issuer authentication extracted from IssuerSigned. */
  issuerAuth: IssuerAuth;
}

/**
 * Converts an IssuerSigned Map structure to a plain object.
 *
 * @description
 * Extracts the `nameSpaces` and `issuerAuth` fields from an `IssuerSigned` Map
 * and returns them as a plain object. This function performs validation to ensure
 * both required fields are present in the input structure.
 *
 * @param issuerSigned - The IssuerSigned Map structure containing nameSpaces and issuerAuth.
 * @returns An object containing the extracted nameSpaces and issuerAuth.
 *
 * @throws {ErrorCodeError}
 * Throws an error if `issuerAuth` is missing with code {@link MdocErrorCode.IssuerAuthMissing}.
 * Throws an error if `nameSpaces` is missing with code {@link MdocErrorCode.IssuerNameSpacesMissing}.
 *
 * @see {@link IssuerSigned}
 * @see {@link IssuerNameSpaces}
 * @see {@link IssuerAuth}
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const issuerSigned: IssuerSigned = new Map([
 *   ['nameSpaces', nameSpacesMap],
 *   ['issuerAuth', issuerAuthMap],
 * ]);
 * const result = toIssuerSignedObject(issuerSigned);
 * // result.nameSpaces and result.issuerAuth are now available as plain objects
 * ```
 */
export const toIssuerSignedObject = (
  issuerSigned: IssuerSigned
): ToIssuerSignedObjectResult => {
  const issuerAuth = issuerSigned.get('issuerAuth');
  if (!issuerAuth) {
    throw new ErrorCodeError(
      'The issuer authentication is missing.',
      MdocErrorCode.IssuerAuthMissing
    );
  }

  const nameSpaces = issuerSigned.get('nameSpaces');
  if (!nameSpaces) {
    throw new ErrorCodeError(
      'The name spaces are missing.',
      MdocErrorCode.IssuerNameSpacesMissing
    );
  }

  return { nameSpaces, issuerAuth };
};
