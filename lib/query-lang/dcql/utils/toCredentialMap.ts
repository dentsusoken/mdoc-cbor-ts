import { DcqlCredential } from '../schemas/DcqlCredential';

/**
 * Converts an array of DCQL credentials into a Map keyed by credential ID.
 *
 * @description
 * This function creates a lookup map from an array of credentials, where each credential's
 * `id` property is used as the key. All credentials in the input array are included in
 * the resulting map since `id` is a required property of {@link DcqlCredential}.
 *
 * This is useful for efficient lookup of credentials by their ID, especially when
 * working with credential references in credential sets or when you need to quickly
 * find a specific credential from a list of credential IDs.
 *
 * @param {DcqlCredential[]} credentials - Array of DCQL credentials to convert.
 *   Each credential must have an `id` property (required by the schema).
 * @returns {Map<string, DcqlCredential>} A Map from credential ID (string) to the
 *   corresponding DcqlCredential object. All credentials from the input array are
 *   included in the map.
 *
 * @see {@link DcqlCredential} - For the structure of DCQL credentials.
 * @see {@link toClaimMap} - For a similar function that converts claims to a map.
 *
 * @example
 * ```typescript
 * const credentials: DcqlCredential[] = [
 *   {
 *     id: 'credential-1',
 *     format: 'mso_mdoc',
 *     meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *     claims: [
 *       { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *     ],
 *   },
 *   {
 *     id: 'credential-2',
 *     format: 'mso_mdoc',
 *     meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
 *     claims: [
 *       { path: ['org.iso.18013.5.2', 'license_number'], intent_to_retain: false },
 *     ],
 *   },
 * ];
 *
 * const credentialMap = toCredentialMap(credentials);
 * // Returns: Map([
 * //   ['credential-1', { id: 'credential-1', format: 'mso_mdoc', ... }],
 * //   ['credential-2', { id: 'credential-2', format: 'mso_mdoc', ... }]
 * // ])
 * ```
 *
 * @example
 * ```typescript
 * // Using the map for lookup
 * const credentialMap = toCredentialMap(credentials);
 * const credential = credentialMap.get('credential-1');
 * // Returns the credential with id 'credential-1', or undefined if not found
 *
 * // Validating credential IDs in credential sets
 * const credentialSet = {
 *   options: [['credential-1', 'credential-2']],
 *   required: true,
 * };
 *
 * for (const option of credentialSet.options) {
 *   for (const credentialId of option) {
 *     if (!credentialMap.has(credentialId)) {
 *       throw new Error(`Credential ID "${credentialId}" not found`);
 *     }
 *   }
 * }
 * ```
 */
export const toCredentialMap = (
  credentials: DcqlCredential[]
): Map<string, DcqlCredential> => {
  const credentialMap = new Map<string, DcqlCredential>();

  for (const credential of credentials) {
    credentialMap.set(credential.id, credential);
  }

  return credentialMap;
};
