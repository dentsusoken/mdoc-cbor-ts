import { Document } from '@/schemas/mdoc/Document';
import { DcqlQuery } from '../schemas/DcqlQuery';
import { toCredentialMap } from '../utils/toCredentialMap';
import { selectDocumentsClaimsByCredentialSet } from './selectDocumentsClaimsByCredentialSet';
import { selectDocumentsClaimsByCredentials } from './selectDocumentsClaimsByCredentials';

/**
 * Selects and filters Documents based on a DCQL query.
 *
 * @description
 * This function processes an array of documents against a DCQL query, which can contain either
 * credential sets or individual credentials. The function handles two modes of operation:
 *
 * **Mode 1: Credential Sets** (when `query.credential_sets` is present):
 * - Processes each credential set in order using {@link selectDocumentsClaimsByCredentialSet}.
 * - Merges results from all matching credential sets into a single Map.
 * - If a `required: true` credential set does not match, throws an error immediately
 *   (processing stops at the first unsatisfied required credential set).
 * - If a `required: false` credential set does not match, continues to the next credential set.
 * - Returns a Map containing all credentials from all matching credential sets.
 *
 * **Mode 2: Individual Credentials** (when `query.credential_sets` is not present):
 * - Processes all credentials using {@link selectDocumentsClaimsByCredentials}.
 * - Returns a Map where each key is a credential ID and the value is an array of matching documents.
 * - Returns `undefined` if any credential does not match.
 *
 * Processing behavior for credential sets:
 * 1. Creates a credential map from `query.credentials` for efficient lookup.
 * 2. Iterates through each credential set in `query.credential_sets`.
 * 3. For each credential set, calls {@link selectDocumentsClaimsByCredentialSet} to find matching documents.
 * 4. If matching documents are found, merges them into the result Map.
 * 5. If a `required: true` credential set does not match, throws an error (stops processing).
 * 6. If a `required: false` credential set does not match, continues to the next credential set.
 * 7. Returns the merged result Map containing all credentials from all matching credential sets.
 *
 * The function returns a Map where:
 * - Keys are credential IDs (strings).
 * - Values are arrays of Documents that match the corresponding credential.
 *
 * @param {Document[]} documents - Array of Documents to filter. Each document must contain
 *   docType, issuerSigned with issuerAuth and nameSpaces.
 * @param {DcqlQuery} query - DCQL query containing either credential sets or individual credentials.
 *   If `credential_sets` is present, it takes precedence over individual credentials.
 *   All credential IDs referenced in `credential_sets` must exist in `query.credentials`.
 *
 * @returns {Map<string, Document[]> | undefined} A Map from credential ID to an array of matching
 *   Documents. For credential sets mode, returns a Map containing all credentials from all
 *   matching credential sets. For individual credentials mode, returns a Map if all credentials
 *   match, or `undefined` if any credential does not match. Returns an empty Map if no credential
 *   sets match (when all are optional).
 *
 * @throws {Error} If any credential ID in a credential set is not found in `query.credentials`.
 *   Error message: `"Credential with id {id} not found"`.
 *   (thrown by {@link selectDocumentsClaimsByCredentialSet})
 * @throws {Error} If a `required: true` credential set does not match any documents.
 *   Error message: `"The required credential set did not match any documents. Options: {options}"`.
 *   (thrown by {@link selectDocumentsClaimsByCredentialSet})
 *   Processing stops at the first unsatisfied required credential set.
 * @throws {ErrorCodeError} If any document's docType is missing.
 *   Error code: {@link MdocErrorCode.DocTypeMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredentialSet} or {@link selectDocumentsClaimsByCredentials})
 * @throws {ErrorCodeError} If any document's issuerSigned structure is missing.
 *   Error code: {@link MdocErrorCode.IssuerSignedMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredentialSet} or {@link selectDocumentsClaimsByCredentials})
 * @throws {ErrorCodeError} If any document's issuerAuth is missing.
 *   Error code: {@link MdocErrorCode.IssuerAuthMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredentialSet} or {@link selectDocumentsClaimsByCredentials})
 * @throws {ErrorCodeError} If any document's nameSpaces are missing.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredentialSet} or {@link selectDocumentsClaimsByCredentials})
 * @throws {ErrorCodeError} If name space selection fails due to an unexpected error.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesSelectionFailed}
 *   (thrown by {@link selectDocumentsClaimsByCredentialSet} or {@link selectDocumentsClaimsByCredentials})
 *
 * @see {@link selectDocumentsClaimsByCredentialSet} - For details on credential set processing.
 * @see {@link selectDocumentsClaimsByCredentials} - For details on individual credential processing.
 * @see {@link DcqlQuery} - For the structure of DCQL queries.
 *
 * @example
 * ```typescript
 * // Example 1: Query with credential sets
 * const query: DcqlQuery = {
 *   credentials: [
 *     {
 *       id: 'cred-1',
 *       format: 'mso_mdoc',
 *       meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *       claims: [
 *         { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *       ],
 *       multiple: false,
 *     },
 *     {
 *       id: 'cred-2',
 *       format: 'mso_mdoc',
 *       meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
 *       claims: [
 *         { path: ['org.iso.18013.5.2', 'license_number'], intent_to_retain: false },
 *       ],
 *       multiple: false,
 *     },
 *   ],
 *   credential_sets: [
 *     {
 *       options: [['cred-1', 'cred-2']],
 *       required: true,
 *     },
 *   ],
 * };
 *
 * const result = selectDocumentsClaimsByQuery(documents, query);
 * // Returns: Map([
 * //   ['cred-1', [document1]],
 * //   ['cred-2', [document2]]
 * // ])
 * ```
 *
 * @example
 * ```typescript
 * // Example 2: Query with multiple credential sets (first required fails)
 * const query: DcqlQuery = {
 *   credentials: [
 *     { id: 'cred-1', format: 'mso_mdoc', meta: { doctype_value: 'org.iso.18013.5.1.mDL' }, multiple: false },
 *     { id: 'cred-2', format: 'mso_mdoc', meta: { doctype_value: 'org.iso.18013.5.2.mDL' }, multiple: false },
 *   ],
 *   credential_sets: [
 *     {
 *       options: [['cred-1', 'cred-2']],
 *       required: true,  // First required set
 *     },
 *     {
 *       options: [['cred-1']],
 *       required: false,  // Optional set (will not be processed if first fails)
 *     },
 *   ],
 * };
 *
 * // If first credential set does not match:
 * // Throws Error("The required credential set did not match any documents...")
 * // Second credential set is not processed
 * ```
 *
 * @example
 * ```typescript
 * // Example 3: Query without credential sets (individual credentials)
 * const query: DcqlQuery = {
 *   credentials: [
 *     {
 *       id: 'cred-1',
 *       format: 'mso_mdoc',
 *       meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *       claims: [
 *         { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *       ],
 *       multiple: false,
 *     },
 *     {
 *       id: 'cred-2',
 *       format: 'mso_mdoc',
 *       meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
 *       claims: [
 *         { path: ['org.iso.18013.5.2', 'license_number'], intent_to_retain: false },
 *       ],
 *       multiple: false,
 *     },
 *   ],
 * };
 *
 * const result = selectDocumentsClaimsByQuery(documents, query);
 * // Returns: Map([
 * //   ['cred-1', [document1]],
 * //   ['cred-2', [document2]]
 * // ]) if all credentials match, or undefined if any credential does not match
 * ```
 */
export const selectDocumentsClaimsByQuery = (
  documents: Document[],
  query: DcqlQuery
): Map<string, Document[]> | undefined => {
  if (query.credential_sets) {
    const credentialMap = toCredentialMap(query.credentials);
    const result = new Map<string, Document[]>();

    for (const credentialSet of query.credential_sets) {
      const selectedDocuments = selectDocumentsClaimsByCredentialSet(
        documents,
        credentialSet,
        credentialMap
      );

      if (selectedDocuments) {
        selectedDocuments.forEach((documents, credentialId) => {
          result.set(credentialId, documents);
        });
      }
    }

    return result;
  }

  return selectDocumentsClaimsByCredentials(documents, query.credentials);
};
