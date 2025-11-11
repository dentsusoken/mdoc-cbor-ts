import { Document } from '@/schemas/mdoc/Document';
import { DcqlCredential } from '../schemas/DcqlCredential';
import { selectDocumentClaims } from './selectDocumentClaims';

/**
 * Selects and filters multiple Documents based on DCQL credential claims.
 *
 * This function processes an array of Documents and returns those that match
 * the credential's requirements. For each document, it uses {@link selectDocumentClaims}
 * to filter the document based on the credential's claims or claim sets.
 *
 * The function's behavior depends on the `credential.multiple` property:
 * - If `multiple` is `false` (default): Returns only the first matching document
 *   and stops processing remaining documents
 * - If `multiple` is `true`: Returns all matching documents
 *
 * Processing flow:
 * 1. Iterates through each document in the input array
 * 2. Calls {@link selectDocumentClaims} for each document
 * 3. If a document matches (returns a non-undefined result), adds it to the result array
 * 4. If `credential.multiple` is `false`, breaks after the first match
 * 5. Returns the array of selected documents
 *
 * @param documents - Array of Documents to filter. Each document must contain
 *   docType, issuerSigned with issuerAuth and nameSpaces.
 * @param credential - The DCQL credential query specifying the document type and
 *   claim requirements. The `multiple` property controls whether to return a single
 *   document or all matching documents.
 * @returns An array of Documents that match the credential's requirements.
 *   Returns an empty array if no documents match. If `credential.multiple` is `false`,
 *   the array contains at most one document.
 * @throws {ErrorCodeError} If any document's docType is missing.
 *   Error code: {@link MdocErrorCode.DocTypeMissing}
 *   (thrown by {@link selectDocumentClaims})
 * @throws {ErrorCodeError} If any document's issuerSigned structure is missing.
 *   Error code: {@link MdocErrorCode.IssuerSignedMissing}
 *   (thrown by {@link selectDocumentClaims})
 * @throws {ErrorCodeError} If any document's issuerAuth is missing.
 *   Error code: {@link MdocErrorCode.IssuerAuthMissing}
 *   (thrown by {@link selectDocumentClaims})
 * @throws {ErrorCodeError} If any document's nameSpaces are missing.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesMissing}
 *   (thrown by {@link selectDocumentClaims})
 * @throws {ErrorCodeError} If name space selection fails due to an unexpected error.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesSelectionFailed}
 *   (thrown by {@link selectDocumentClaims})
 *
 * @example
 * ```typescript
 * // Example 1: Select single document (multiple: false)
 * const documents = [
 *   createDocument([['docType', 'org.iso.18013.5.1.mDL'], ['issuerSigned', issuerSigned1]]),
 *   createDocument([['docType', 'org.iso.18013.5.1.mDL'], ['issuerSigned', issuerSigned2]]),
 * ];
 *
 * const credential: DcqlCredential = {
 *   id: 'cred-1',
 *   format: 'mso_mdoc',
 *   meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *   multiple: false,
 *   claims: [
 *     { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   ],
 * };
 *
 * const result = selectDocumentsClaims(documents, credential);
 * // Returns: [selectedDocument1] (stops after first match)
 * ```
 *
 * @example
 * ```typescript
 * // Example 2: Select multiple documents (multiple: true)
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
 *   multiple: true,
 *   claims: [
 *     { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   ],
 * };
 *
 * const result = selectDocumentsClaims(documents, credential);
 * // Returns: [selectedDocument1, selectedDocument2]
 * // (document3 is excluded due to docType mismatch)
 * ```
 *
 * @example
 * ```typescript
 * // Example 3: No matching documents
 * const documents = [
 *   createDocument([['docType', 'org.iso.18013.5.2.mDL'], ['issuerSigned', issuerSigned1]]),
 * ];
 *
 * const credential: DcqlCredential = {
 *   id: 'cred-1',
 *   format: 'mso_mdoc',
 *   meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *   multiple: false,
 *   claims: [
 *     { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   ],
 * };
 *
 * const result = selectDocumentsClaims(documents, credential);
 * // Returns: [] (empty array, no matches)
 * ```
 */
export const selectDocumentsClaims = (
  documents: Document[],
  credential: DcqlCredential
): Document[] => {
  const result: Document[] = [];

  for (const document of documents) {
    const selectedDocument = selectDocumentClaims(document, credential);

    if (selectedDocument) {
      result.push(selectedDocument);

      if (!credential.multiple) {
        break;
      }
    }
  }

  return result;
};
