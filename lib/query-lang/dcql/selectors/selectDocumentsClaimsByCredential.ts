import { Document } from '@/schemas/mdoc/Document';
import { DcqlCredential } from '../schemas/DcqlCredential';
import { selectDocumentClaimsByCredential } from './selectDocumentClaimsByCredential';

/**
 * Selects and filters multiple Documents based on a DCQL credential.
 *
 * @description
 * This function processes an array of documents against a single DCQL credential query,
 * returning all documents that match the credential's requirements. The function iterates
 * through each document and uses {@link selectDocumentClaimsByCredential} to determine if it matches
 * the credential's document type and claim constraints.
 *
 * Processing behavior:
 * 1. Iterates through each document in the input array.
 * 2. For each document, calls {@link selectDocumentClaimsByCredential} to check if it matches the credential.
 * 3. If a document matches, it is added to the result array.
 * 4. If `credential.multiple` is `false`, the function stops after finding the first match.
 * 5. If `credential.multiple` is `true`, the function continues processing all documents.
 *
 * The function returns `undefined` if no documents match the credential requirements.
 * A document is considered not matching if:
 * - The document's docType does not match the credential's `meta.doctype_value`
 * - The document does not contain the required claims specified in the credential
 *
 * @param {Document[]} documents - Array of Documents to filter. Each document must contain
 *   docType, issuerSigned with issuerAuth and nameSpaces.
 * @param {DcqlCredential} credential - The DCQL credential query specifying the document type
 *   and claim requirements. The credential's `meta.doctype_value` must match a document's
 *   docType for selection to proceed. The `multiple` property determines whether multiple
 *   documents can be returned.
 *
 * @returns {Document[] | undefined} An array of Documents that match the credential requirements,
 *   or `undefined` if no documents match (either due to docType mismatch or missing required claims).
 *   If `credential.multiple` is `false`, the array contains at most one document.
 *
 * @throws {ErrorCodeError} If any document's docType is missing.
 *   Error code: {@link MdocErrorCode.DocTypeMissing}
 *   (thrown by {@link selectDocumentClaimsByCredential})
 * @throws {ErrorCodeError} If any document's issuerSigned structure is missing.
 *   Error code: {@link MdocErrorCode.IssuerSignedMissing}
 *   (thrown by {@link selectDocumentClaimsByCredential})
 * @throws {ErrorCodeError} If any document's issuerAuth is missing.
 *   Error code: {@link MdocErrorCode.IssuerAuthMissing}
 *   (thrown by {@link selectDocumentClaimsByCredential})
 * @throws {ErrorCodeError} If any document's nameSpaces are missing.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesMissing}
 *   (thrown by {@link selectDocumentClaimsByCredential})
 * @throws {ErrorCodeError} If name space selection fails due to an unexpected error.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesSelectionFailed}
 *   (thrown by {@link selectDocumentClaimsByCredential})
 *
 * @see {@link selectDocumentClaimsByCredential} - For details on individual document matching.
 * @see {@link DcqlCredential} - For the structure of DCQL credentials.
 *
 * @example
 * ```typescript
 * // Example 1: Single document match (multiple: false)
 * const documents = [
 *   createDocument([['docType', 'org.iso.18013.5.1.mDL'], ['issuerSigned', issuerSigned1]]),
 *   createDocument([['docType', 'org.iso.18013.5.1.mDL'], ['issuerSigned', issuerSigned2]]),
 * ];
 *
 * const credential: DcqlCredential = {
 *   id: 'cred-1',
 *   format: 'mso_mdoc',
 *   meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *   claims: [
 *     { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   ],
 *   multiple: false,
 * };
 *
 * const result = selectDocumentsClaimsByCredential(documents, credential);
 * // Returns: [selectedDocument1] (stops after first match)
 * ```
 *
 * @example
 * ```typescript
 * // Example 2: Multiple document matches (multiple: true)
 * const documents = [
 *   createDocument([['docType', 'org.iso.18013.5.1.mDL'], ['issuerSigned', issuerSigned1]]),
 *   createDocument([['docType', 'org.iso.18013.5.1.mDL'], ['issuerSigned', issuerSigned2]]),
 *   createDocument([['docType', 'org.iso.18013.5.2.mDL'], ['issuerSigned', issuerSigned3]]),
 * ];
 *
 * const credential: DcqlCredential = {
 *   id: 'cred-1',
 *   format: 'mso_mdoc',
 *   meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *   claims: [
 *     { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   ],
 *   multiple: true,
 * };
 *
 * const result = selectDocumentsClaimsByCredential(documents, credential);
 * // Returns: [selectedDocument1, selectedDocument2] (both match, continues processing)
 * ```
 *
 * @example
 * ```typescript
 * // Example 3: No matches - docType mismatch
 * const documents = [
 *   createDocument([['docType', 'org.iso.18013.5.2.mDL'], ['issuerSigned', issuerSigned1]]),
 * ];
 *
 * const credential: DcqlCredential = {
 *   id: 'cred-1',
 *   format: 'mso_mdoc',
 *   meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *   claims: [
 *     { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   ],
 *   multiple: false,
 * };
 *
 * const result = selectDocumentsClaimsByCredential(documents, credential);
 * // Returns: undefined (docType mismatch)
 * ```
 *
 * @example
 * ```typescript
 * // Example 4: No matches - required claims not found
 * const documents = [
 *   createDocument([['docType', 'org.iso.18013.5.1.mDL'], ['issuerSigned', issuerSigned1]]),
 * ];
 *
 * const credential: DcqlCredential = {
 *   id: 'cred-1',
 *   format: 'mso_mdoc',
 *   meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *   claims: [
 *     { path: ['org.iso.18013.5.1', 'non_existent_claim'], intent_to_retain: false },
 *   ],
 *   multiple: false,
 * };
 *
 * const result = selectDocumentsClaimsByCredential(documents, credential);
 * // Returns: undefined (required claims not found in document)
 * ```
 */
export const selectDocumentsClaimsByCredential = (
  documents: Document[],
  credential: DcqlCredential
): Document[] | undefined => {
  const result: Document[] = [];

  for (const document of documents) {
    const selectedDocument = selectDocumentClaimsByCredential(
      document,
      credential
    );

    if (selectedDocument) {
      result.push(selectedDocument);

      if (!credential.multiple) {
        break;
      }
    }
  }

  if (result.length === 0) {
    return undefined;
  }

  return result;
};
