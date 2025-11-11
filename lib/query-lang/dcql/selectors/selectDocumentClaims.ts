import { createDocument, Document } from '@/schemas/mdoc/Document';
import { DcqlCredential } from '../schemas/DcqlCredential';
import { createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { MdocErrorCode } from '@/mdoc/types';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { selectIssuerNameSpaces } from './selectIssuerNameSpaces';

/**
 * Selects and filters a Document based on DCQL credential claims.
 *
 * This function validates a Document against a DCQL credential query and returns
 * a new Document containing only the issuer-signed name spaces that match the
 * credential's claims or claim sets. The function performs the following steps:
 *
 * 1. Validates that the document has required fields (docType, issuerSigned, issuerAuth, nameSpaces)
 * 2. Checks if the document's docType matches the credential's doctype_value
 * 3. Selects issuer-signed name spaces using {@link selectIssuerNameSpaces} based on
 *    the credential's claims and claim_sets
 * 4. Creates and returns a new Document with the selected name spaces and original issuerAuth
 *
 * The function returns `undefined` if:
 * - The document's docType does not match the credential's doctype_value
 * - The issuer name space selection fails (no claims/claim sets can be satisfied)
 *
 * @param document - The Document to filter. Must contain docType, issuerSigned with
 *   issuerAuth and nameSpaces.
 * @param credential - The DCQL credential query specifying the document type and
 *   claim requirements. The credential's `meta.doctype_value` must match the document's
 *   docType for selection to proceed.
 * @returns A new Document containing only the selected issuer-signed name spaces
 *   and the original issuerAuth, or `undefined` if the document type doesn't match
 *   or name space selection fails.
 * @throws {ErrorCodeError} If the document's docType is missing.
 *   Error code: {@link MdocErrorCode.DocTypeMissing}
 * @throws {ErrorCodeError} If the document's issuerSigned structure is missing.
 *   Error code: {@link MdocErrorCode.IssuerSignedMissing}
 * @throws {ErrorCodeError} If the document's issuerAuth is missing.
 *   Error code: {@link MdocErrorCode.IssuerAuthMissing}
 * @throws {ErrorCodeError} If the document's nameSpaces are missing.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesMissing}
 * @throws {ErrorCodeError} If name space selection fails due to an unexpected error.
 *   Error code: {@link MdocErrorCode.IssuerNameSpacesSelectionFailed}
 *   (thrown by {@link selectIssuerNameSpaces})
 *
 * @example
 * ```typescript
 * // Example: Select document with matching docType and satisfied claims
 * const document = createDocument([
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['issuerSigned', issuerSignedWithNameSpaces],
 * ]);
 *
 * const credential: DcqlCredential = {
 *   id: 'cred-1',
 *   format: 'mso_mdoc',
 *   meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *   claims: [
 *     { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *     { path: ['org.iso.18013.5.1', 'family_name'], intent_to_retain: false },
 *   ],
 * };
 *
 * const result = selectDocumentClaims(document, credential);
 * // Returns: New Document with selected name spaces containing given_name and family_name
 * ```
 *
 * @example
 * ```typescript
 * // Example: Document type mismatch returns undefined
 * const document = createDocument([
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['issuerSigned', issuerSignedWithNameSpaces],
 * ]);
 *
 * const credential: DcqlCredential = {
 *   id: 'cred-1',
 *   format: 'mso_mdoc',
 *   meta: { doctype_value: 'org.iso.18013.5.2.mDL' }, // Different docType
 *   claims: [
 *     { path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   ],
 * };
 *
 * const result = selectDocumentClaims(document, credential);
 * // Returns: undefined (docType mismatch)
 * ```
 *
 * @example
 * ```typescript
 * // Example: Name space selection failure returns undefined
 * const document = createDocument([
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['issuerSigned', issuerSignedWithNameSpaces],
 * ]);
 *
 * const credential: DcqlCredential = {
 *   id: 'cred-1',
 *   format: 'mso_mdoc',
 *   meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
 *   claims: [
 *     { path: ['org.iso.18013.5.1', 'non_existent'], intent_to_retain: false },
 *   ],
 * };
 *
 * const result = selectDocumentClaims(document, credential);
 * // Returns: undefined (name space selection fails)
 * ```
 */
export const selectDocumentClaims = (
  document: Document,
  credential: DcqlCredential
): Document | undefined => {
  const docType = document.get('docType');
  if (!docType) {
    throw new ErrorCodeError(
      'The document type is missing.',
      MdocErrorCode.DocTypeMissing
    );
  }

  if (docType !== credential.meta.doctype_value) {
    return undefined;
  }

  const issuerSigned = document.get('issuerSigned');
  if (!issuerSigned) {
    throw new ErrorCodeError(
      'The issuer-signed structure is missing.',
      MdocErrorCode.IssuerSignedMissing
    );
  }

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
      'The name spaces are missing.',
      MdocErrorCode.IssuerNameSpacesMissing
    );
  }

  const selectedNameSpaces = selectIssuerNameSpaces({
    nameSpaces,
    claims: credential.claims,
    claimSets: credential.claim_sets,
  });

  if (!selectedNameSpaces) {
    return undefined;
  }

  const newIssuerSigned = createIssuerSigned([
    ['nameSpaces', selectedNameSpaces],
    ['issuerAuth', issuerAuth],
  ]);

  return createDocument([
    ['docType', docType],
    ['issuerSigned', newIssuerSigned],
  ]);
};
