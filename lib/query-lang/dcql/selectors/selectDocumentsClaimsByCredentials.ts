import { Document } from '@/schemas/mdoc/Document';
import { DcqlCredential } from '../schemas/DcqlCredential';
import { selectDocumentsClaimsByCredential } from './selectDocumentsClaimsByCredential';

/**
 * Selects and filters Documents for multiple DCQL credentials.
 *
 * @description
 * This function processes an array of documents against multiple DCQL credential queries,
 * returning a Map where each key is a credential ID and the value is an array of documents
 * that match that credential's requirements. The function iterates through each credential
 * and uses {@link selectDocumentsClaimsByCredential} to find matching documents.
 *
 * Processing behavior:
 * 1. Iterates through each credential in the input array.
 * 2. For each credential, calls {@link selectDocumentsClaimsByCredential} to find matching documents.
 * 3. If matching documents are found (returns an array), adds them to the result Map
 *    with the credential ID as the key.
 * 4. If no matching documents are found for a credential (returns `undefined`), returns `undefined`
 *    immediately, indicating that not all credentials could be matched.
 *
 * The function returns a Map where:
 * - Keys are credential IDs (strings).
 * - Values are arrays of Documents that match the corresponding credential.
 *
 * @param {Document[]} documents - Array of Documents to filter. Each document must contain
 *   docType, issuerSigned with issuerAuth and nameSpaces.
 * @param {DcqlCredential[]} credentials - Array of DCQL credential queries. Each credential
 *   specifies a document type and claim requirements. The credential's `meta.doctype_value`
 *   must match a document's docType for selection to proceed.
 *
 * @returns {Map<string, Document[]> | undefined} A Map from credential ID to an array of matching
 *   Documents if all credentials match, or `undefined` if any credential does not match any documents.
 *   The Map contains entries for all credentials in the input array when successful.
 * @throws {ErrorCodeError} If any document's docType is missing.
 *   Error code: {@link MdocErrorCode.DocTypeMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredential})
 * @throws {ErrorCodeError} If any document's issuerSigned structure is missing.
 *   Error code: {@link MdocErrorCode.IssuerSignedMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredential})
 * @throws {ErrorCodeError} If any document's issuerAuth is missing.
 *   Error code: {@link MdocErrorCode.IssuerAuthMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredential})
 * @throws {ErrorCodeError} If any document's nameSpaces are missing.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredential})
 * @throws {ErrorCodeError} If name space selection fails due to an unexpected error.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesSelectionFailed}
 *   (thrown by {@link selectDocumentsClaimsByCredential})
 *
 * @see {@link selectDocumentsClaimsByCredential} - For details on individual credential matching.
 * @see {@link DcqlCredential} - For the structure of DCQL credentials.
 *
 * @example
 * ```typescript
 * // Example: Select documents for multiple credentials
 * const documents = [
 *   createDocument([['docType', 'org.iso.18013.5.1.mDL'], ['issuerSigned', issuerSigned1]]),
 *   createDocument([['docType', 'org.iso.18013.5.2.mDL'], ['issuerSigned', issuerSigned2]]),
 * ];
 *
 * const credentials: DcqlCredential[] = [
 *   {
 *     id: 'cred-1',
 *     format: 'mso_mdoc',
 *     meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *     claims: [
 *       { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *     ],
 *     multiple: false,
 *   },
 *   {
 *     id: 'cred-2',
 *     format: 'mso_mdoc',
 *     meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
 *     claims: [
 *       { path: ['org.iso.18013.5.2', 'license_number'], intent_to_retain: false },
 *     ],
 *     multiple: false,
 *   },
 * ];
 *
 * const result = selectDocumentsClaimsByCredentials(documents, credentials);
 * // Returns: Map([
 * //   ['cred-1', [document1]],
 * //   ['cred-2', [document2]]
 * // ])
 * ```
 *
 * @example
 * ```typescript
 * // Example: Returns undefined when a credential does not match
 * const documents = [
 *   createDocument([['docType', 'org.iso.18013.5.1.mDL'], ['issuerSigned', issuerSigned1]]),
 * ];
 *
 * const credentials: DcqlCredential[] = [
 *   {
 *     id: 'cred-1',
 *     format: 'mso_mdoc',
 *     meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *     claims: [
 *       { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *     ],
 *     multiple: false,
 *   },
 *   {
 *     id: 'cred-2',
 *     format: 'mso_mdoc',
 *     meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
 *     claims: [
 *       { path: ['org.iso.18013.5.2', 'license_number'], intent_to_retain: false },
 *     ],
 *     multiple: false,
 *   },
 * ];
 *
 * const result = selectDocumentsClaimsByCredentials(documents, credentials);
 * // Returns: undefined (cred-2 does not match any documents)
 * ```
 */
export const selectDocumentsClaimsByCredentials = (
  documents: Document[],
  credentials: DcqlCredential[]
): Map<string, Document[]> | undefined => {
  const result: Map<string, Document[]> = new Map();

  for (const credential of credentials) {
    const selectedDocuments = selectDocumentsClaimsByCredential(
      documents,
      credential
    );

    if (selectedDocuments) {
      result.set(credential.id, selectedDocuments);
    } else {
      return undefined;
    }
  }

  return result;
};
