import { toIssuerSignedDocumentObject } from '@/handlers/to-object';
import { Document } from '@/schemas/mdoc/Document';
import { DocumentError } from '@/schemas/mdoc/DocumentError';
import { verifyIssuerSigned } from '../mso/verifyIssuerSigned';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { getErrorMessage } from '@/utils/getErrorMessage';

/**
 * Parameters for verifying multiple issuer-signed documents.
 *
 * @property {Document[]} issuerSignedDocuments - Array of documents to verify.
 * @property {Date} [now] - The current date and time for evaluating validity dates. Defaults to `new Date()`.
 * @property {number} [clockSkew] - Acceptable clock skew in seconds. Defaults to `60`.
 */
interface VerifyIssuerSignedDocumentsParams {
  issuerSignedDocuments: Document[];
  now?: Date;
  clockSkew?: number;
}

/**
 * Result of verifying multiple issuer-signed documents.
 *
 * @property {Document[]} documents - Array of successfully verified documents.
 * @property {DocumentError[]} documentErrors - Array of document errors, where each error is a Map of docType to error code.
 */
interface VerifyIssuerSignedDocumentsResult {
  documents: Document[];
  documentErrors: DocumentError[];
}

/**
 * Verifies multiple issuer-signed documents in batch.
 *
 * @description
 * This function processes an array of documents and verifies each one's issuer-signed structure.
 * For each document:
 * 1. Extracts the `docType` and `issuerSigned` structure using {@link toIssuerSignedDocumentObject}.
 * 2. Verifies the issuer-signed structure using {@link verifyIssuerSigned}, which performs:
 *    - IssuerAuth verification (signature and certificate chain)
 *    - Mobile Security Object (MSO) validation
 *    - Value digests verification
 *    - Validity information verification
 * 3. If verification succeeds, the document is added to the `documents` array.
 * 4. If verification fails, a {@link DocumentError} is created mapping the document's `docType` to the error code,
 *    and added to the `documentErrors` array.
 *
 * The function continues processing all documents even if some fail, allowing for partial success scenarios.
 * Errors are captured and returned rather than thrown, enabling batch processing with error collection.
 *
 * @param {VerifyIssuerSignedDocumentsParams} params - The parameters for verification.
 * @param {Document[]} params.issuerSignedDocuments - Array of documents to verify.
 * @param {Date} [params.now] - The current date and time for evaluating validity dates. Defaults to `new Date()`.
 * @param {number} [params.clockSkew] - Acceptable clock skew in seconds. Defaults to `60`.
 *
 * @returns {VerifyIssuerSignedDocumentsResult} An object containing:
 *   - `documents`: Array of successfully verified documents.
 *   - `documentErrors`: Array of document errors, where each error is a Map of docType to error code.
 *
 * @see {@link verifyIssuerSigned} - For details on individual document verification.
 * @see {@link toIssuerSignedDocumentObject} - For document structure extraction.
 * @see {@link DocumentError} - For the structure of document errors.
 * @see {@link ErrorCodeError} - For error code details.
 * @see {@link MdocErrorCode} - For available error codes.
 *
 * @example
 * ```typescript
 * const documents: Document[] = [
 *   // ... document instances
 * ];
 *
 * const result = verifyIssuerSignedDocuments({
 *   issuerSignedDocuments: documents,
 *   now: new Date('2024-01-01T00:00:00Z'),
 *   clockSkew: 120, // 2 minutes
 * });
 *
 * // Check results
 * if (result.documentErrors.length > 0) {
 *   console.log('Some documents failed verification:');
 *   result.documentErrors.forEach((error) => {
 *     error.forEach((errorCode, docType) => {
 *       console.log(`${docType}: error code ${errorCode}`);
 *     });
 *   });
 * }
 *
 * // Process successfully verified documents
 * result.documents.forEach((document) => {
 *   // ... process document
 * });
 * ```
 */
export const verifyIssuerSignedDocuments = ({
  issuerSignedDocuments,
  now = new Date(),
  clockSkew = 60,
}: VerifyIssuerSignedDocumentsParams): VerifyIssuerSignedDocumentsResult => {
  const documents: Document[] = [];
  const documentErrors: DocumentError[] = [];

  issuerSignedDocuments.forEach((document) => {
    const { docType, issuerSigned } = toIssuerSignedDocumentObject(document);

    try {
      verifyIssuerSigned({ issuerSigned, now, clockSkew });
      documents.push(document);
    } catch (error) {
      console.log(getErrorMessage(error));
      const errorCode =
        error instanceof ErrorCodeError
          ? error.errorCode
          : MdocErrorCode.IssuerSignedVerificationFailed;
      documentErrors.push(new Map([[docType, errorCode]]));
    }
  });

  return { documents, documentErrors };
};
