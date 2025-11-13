import { IssuerAuth } from '@/schemas/mso/IssuerAuth';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { IssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';

/**
 * Plain object representation for extracted issuer-signed data.
 *
 * @description
 * This object type contains the essential extracted values from an `IssuerSigned` structure:
 * - `nameSpaces`: The issuer-signed namespaces (typically a Map from namespace strings to Tag[] arrays).
 * - `issuerAuth`: The issuer authentication signature structure.
 *
 * @property nameSpaces - The issuer-signed nameSpaces extracted from the IssuerSigned structure.
 * @property issuerAuth - The issuer authentication signature (COSE_Sign1 or similar) extracted from the IssuerSigned structure.
 *
 * @see IssuerSigned
 * @see IssuerNameSpaces
 * @see IssuerAuth
 */
export interface IssuerSignedObject {
  /** The issuer-signed nameSpaces extracted from the IssuerSigned map. */
  nameSpaces: IssuerNameSpaces;
  /** The issuer authentication (signature) extracted from the IssuerSigned map. */
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
): IssuerSignedObject => {
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
      'The issuer name spaces are missing.',
      MdocErrorCode.IssuerNameSpacesMissing
    );
  }

  return { nameSpaces, issuerAuth };
};
