import { Document } from '@/schemas/mdoc/Document';
import { DcqlCredentialSet } from '../schemas/DcqlCredentialSet';
import { extractCredentials } from '../utils/extractCredentials';
import { selectDocumentsClaimsByCredentials } from './selectDocumentsClaimsByCredentials';
import { DcqlCredential } from '../schemas/DcqlCredential';

/**
 * Selects and filters Documents for a DCQL credential set using a first-match strategy.
 *
 * @description
 * This function processes an array of documents against a DCQL credential set, which contains
 * multiple credential options. The function uses a first-match strategy: it iterates through
 * each option in the credential set and returns the first set of documents that match all
 * credentials in that option.
 *
 * Processing behavior:
 * 1. Iterates through each option in `credentialSet.options` in order.
 * 2. For each option, extracts the corresponding credential objects from `credentialMap`
 *    using {@link extractCredentials}.
 * 3. Calls {@link selectDocumentsClaimsByCredentials} to find documents that match all
 *    credentials in the option.
 * 4. If matching documents are found, returns the result Map immediately (first-match).
 * 5. If no option matches and `credentialSet.required` is `true`, throws an error.
 * 6. If no option matches and `credentialSet.required` is `false`, returns `undefined`.
 *
 * The function returns a Map where:
 * - Keys are credential IDs (strings).
 * - Values are arrays of Documents that match the corresponding credential.
 *
 * @param {Document[]} documents - Array of Documents to filter. Each document must contain
 *   docType, issuerSigned with issuerAuth and nameSpaces.
 * @param {DcqlCredentialSet} credentialSet - DCQL credential set containing multiple credential
 *   options. Each option is an array of credential IDs that should be matched together.
 *   The `required` flag determines whether an error is thrown if no option matches.
 * @param {Map<string, DcqlCredential>} credentialMap - Map from credential ID (string) to
 *   DcqlCredential object. Typically created using {@link toCredentialMap} for efficient lookup.
 *   Must contain all credential IDs referenced in `credentialSet.options`.
 *
 * @returns {Map<string, Document[]> | undefined} A Map from credential ID to an array of matching
 *   Documents if a matching option is found, or `undefined` if no option matches and the
 *   credential set is not required. The Map contains entries for all credentials in the
 *   matching option.
 *
 * @throws {Error} If any credential ID in an option is not found in `credentialMap`.
 *   Error message: `"Credential with id {id} not found"`.
 *   (thrown by {@link extractCredentials})
 * @throws {Error} If a credential in a matching option does not match any documents.
 *   Error message: `"The credential {credentialId} did not match any documents"`.
 *   (thrown by {@link selectDocumentsClaimsByCredentials})
 * @throws {Error} If no option matches and `credentialSet.required` is `true`.
 *   Error message: `"The required credential set did not match any documents. Options: {options}"`.
 * @throws {ErrorCodeError} If any document's docType is missing.
 *   Error code: {@link MdocErrorCode.DocTypeMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredentials})
 * @throws {ErrorCodeError} If any document's issuerSigned structure is missing.
 *   Error code: {@link MdocErrorCode.IssuerSignedMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredentials})
 * @throws {ErrorCodeError} If any document's issuerAuth is missing.
 *   Error code: {@link MdocErrorCode.IssuerAuthMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredentials})
 * @throws {ErrorCodeError} If any document's nameSpaces are missing.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesMissing}
 *   (thrown by {@link selectDocumentsClaimsByCredentials})
 * @throws {ErrorCodeError} If name space selection fails due to an unexpected error.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesSelectionFailed}
 *   (thrown by {@link selectDocumentsClaimsByCredentials})
 *
 * @see {@link selectDocumentsClaimsByCredentials} - For details on matching multiple credentials.
 * @see {@link extractCredentials} - For extracting credentials from a credential map.
 * @see {@link toCredentialMap} - For creating a credential lookup map.
 * @see {@link DcqlCredentialSet} - For the structure of DCQL credential sets.
 *
 * @example
 * ```typescript
 * // Example: Select documents for a credential set with first-match strategy
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
 *   {
 *     id: 'cred-3',
 *     format: 'mso_mdoc',
 *     meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *     claims: [
 *       { path: ['org.iso.18013.5.1', 'age'], intent_to_retain: false },
 *     ],
 *     multiple: false,
 *   },
 * ];
 *
 * const credentialSet: DcqlCredentialSet = {
 *   options: [
 *     ['cred-1', 'cred-2'],  // First option: both cred-1 and cred-2 must match
 *     ['cred-3'],            // Second option: only cred-3 must match
 *   ],
 *   required: true,
 * };
 *
 * const credentialMap = toCredentialMap(credentials);
 * const result = selectDocumentsClaimsByCredentialSet(
 *   documents,
 *   credentialSet,
 *   credentialMap
 * );
 * // If first option matches: Returns Map([['cred-1', [document1]], ['cred-2', [document2]]])
 * // If only second option matches: Returns Map([['cred-3', [document1]]])
 * // If no option matches: Throws Error("The required credential set did not match any documents...")
 * ```
 *
 * @example
 * ```typescript
 * // Example: Optional credential set (returns undefined if no match)
 * const credentialSet: DcqlCredentialSet = {
 *   options: [['cred-1', 'cred-2']],
 *   required: false,  // Not required
 * };
 *
 * const credentialMap = toCredentialMap(credentials);
 * const result = selectDocumentsClaimsByCredentialSet(
 *   documents,
 *   credentialSet,
 *   credentialMap
 * );
 * // If match found: Returns Map with matching documents
 * // If no match: Returns undefined (no error thrown because required: false)
 * ```
 */
export const selectDocumentsClaimsByCredentialSet = (
  documents: Document[],
  credentialSet: DcqlCredentialSet,
  credentialMap: Map<string, DcqlCredential>
): Map<string, Document[]> | undefined => {
  for (const ids of credentialSet.options) {
    const credentials = extractCredentials(credentialMap, ids);
    try {
      const selectedDocuments = selectDocumentsClaimsByCredentials(
        documents,
        credentials
      );

      if (selectedDocuments) {
        return selectedDocuments;
      }
    } catch {
      // If this option fails, try the next option
      continue;
    }
  }

  if (credentialSet.required) {
    throw new Error(
      `The required credential set did not match any documents. Options: ${JSON.stringify(credentialSet.options)}`
    );
  }

  return undefined;
};
