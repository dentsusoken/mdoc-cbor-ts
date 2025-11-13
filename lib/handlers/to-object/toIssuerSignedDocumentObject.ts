import { Document } from '@/schemas/mdoc/Document';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { IssuerSigned } from '@/schemas/mdoc/IssuerSigned';

/**
 * Plain object representation for extracted issuer-signed document data.
 *
 * @description
 * This object type contains the essential extracted values from a `Document` structure:
 * - `docType`: The document type string (e.g., "org.iso.18013.5.1.mDL").
 * - `issuerSigned`: The issuer-signed structure containing nameSpaces and issuerAuth.
 *
 * @property docType - The document type string extracted from the Document map.
 * @property issuerSigned - The issuer-signed structure (IssuerSigned Map) extracted from the Document map.
 *
 * @see Document
 * @see IssuerSigned
 */
export interface IssuerSignedDocumentObject {
  /** The document type string extracted from the Document map. */
  docType: string;
  /** The issuer-signed structure extracted from the Document map. */
  issuerSigned: IssuerSigned;
}

/**
 * Converts a Document Map structure to a plain object.
 *
 * @description
 * Extracts the `docType` and `issuerSigned` fields from a `Document` Map
 * and returns them as a plain object. This function performs validation to ensure
 * both required fields are present in the input structure.
 *
 * @param document - The Document Map structure containing docType and issuerSigned.
 * @returns An object containing the extracted docType and issuerSigned.
 *
 * @throws {ErrorCodeError}
 * Throws an error if `docType` is missing with code {@link MdocErrorCode.DocTypeMissing}.
 * Throws an error if `issuerSigned` is missing with code {@link MdocErrorCode.IssuerSignedMissing}.
 *
 * @see {@link Document}
 * @see {@link IssuerSigned}
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 *
 * @example
 * ```typescript
 * const document: Document = new Map([
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['issuerSigned', issuerSignedMap],
 * ]);
 * const result = toIssuerSignedDocumentObject(document);
 * // result.docType and result.issuerSigned are now available as plain object properties
 * ```
 */
export const toIssuerSignedDocumentObject = (
  document: Document
): IssuerSignedDocumentObject => {
  const docType = document.get('docType');
  if (!docType) {
    throw new ErrorCodeError(
      'The document type is missing.',
      MdocErrorCode.DocTypeMissing
    );
  }

  const issuerSigned = document.get('issuerSigned');
  if (!issuerSigned) {
    throw new ErrorCodeError(
      'The issuer-signed structure is missing.',
      MdocErrorCode.IssuerSignedMissing
    );
  }

  return {
    docType,
    issuerSigned,
  };
};
