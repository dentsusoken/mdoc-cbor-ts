import { DcqlCredential } from '../schemas/DcqlCredential';

/**
 * Extracts credentials from a credential map by their IDs.
 *
 * @description
 * This function takes a Map of credentials (typically created by {@link toCredentialMap}) and
 * an array of credential IDs, and returns an array of the corresponding credential objects.
 * The order of the returned credentials matches the order of the provided IDs.
 *
 * This is useful for efficiently retrieving multiple credentials from a pre-built lookup map,
 * especially when working with credential references in credential sets or when you have
 * a list of credential IDs and need to retrieve the full credential objects.
 *
 * @param {Map<string, DcqlCredential>} credentialMap - Map from credential ID (string) to
 *   DcqlCredential object. Typically created using {@link toCredentialMap} for efficient lookup.
 * @param {string[]} ids - Array of credential IDs to extract. The order of IDs determines
 *   the order of credentials in the returned array.
 *
 * @returns {DcqlCredential[]} An array of DcqlCredential objects corresponding to the provided IDs,
 *   in the same order as the IDs array.
 *
 * @throws {Error} If any ID in the `ids` array is not found in the `credentialMap`.
 *   Error message: `"Credential with id {id} not found"`.
 *
 * @see {@link toCredentialMap} - For creating a credential lookup map.
 * @see {@link DcqlCredential} - For the structure of DCQL credentials.
 * @see {@link extractClaims} - For a similar function that extracts claims from a claim map.
 *
 * @example
 * ```typescript
 * const credentials: DcqlCredential[] = [
 *   {
 *     id: 'cred-1',
 *     format: 'mso_mdoc',
 *     meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *     claims: [
 *       { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *     ],
 *   },
 *   {
 *     id: 'cred-2',
 *     format: 'mso_mdoc',
 *     meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
 *     claims: [
 *       { path: ['org.iso.18013.5.2', 'license_number'], intent_to_retain: false },
 *     ],
 *   },
 *   {
 *     id: 'cred-3',
 *     format: 'mso_mdoc',
 *     meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *     claims: [
 *       { path: ['org.iso.18013.5.1', 'age'], intent_to_retain: false },
 *     ],
 *   },
 * ];
 *
 * const credentialMap = toCredentialMap(credentials);
 * const extracted = extractCredentials(credentialMap, ['cred-1', 'cred-3']);
 * // Returns: [
 * //   { id: 'cred-1', format: 'mso_mdoc', meta: { doctype_value: 'org.iso.18013.5.1.mDL' }, ... },
 * //   { id: 'cred-3', format: 'mso_mdoc', meta: { doctype_value: 'org.iso.18013.5.1.mDL' }, ... }
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * // Throws error when ID is not found
 * const credentialMap = toCredentialMap(credentials);
 * extractCredentials(credentialMap, ['cred-1', 'non_existent']);
 * // Throws: Error("Credential with id non_existent not found")
 * ```
 */
export const extractCredentials = (
  credentialMap: Map<string, DcqlCredential>,
  ids: string[]
): DcqlCredential[] => {
  return ids.map((id) => {
    const credential = credentialMap.get(id);

    if (!credential) {
      throw new Error(`Credential with id ${id} not found`);
    }

    return credential;
  });
};
