import { createDocument, Document } from '@/schemas/mdoc/Document';
import { createMdoc, Mdoc } from '@/schemas/mdoc/Mdoc';
import { DcqlQuery } from '@/query-lang/dcql/schemas/DcqlQuery';
import { JwkPrivateKey } from '@/jwk/types';
import { MdocStatus, SessionTranscript } from '@/mdoc/types';
import { selectDocumentsClaimsByQuery } from '@/query-lang/dcql/selectors/selectDocumentsClaimsByQuery';
import { verifyIssuerSignedDocuments } from '@/handlers/verify/mdoc/verifyIssuerSignedDocuments';
import { buildDeviceSigned } from '@/handlers';
import { toIssuerSignedDocumentObject } from '@/handlers/to-object/toIssuerSignedDocumentObject';
import { createTag24 } from '@/cbor/createTag24';

/**
 * Parameters for building a device response (mdoc) from issuer-signed documents.
 *
 * @property {Document[]} issuerSignedDocuments - Array of issuer-signed documents to process.
 * @property {DcqlQuery} query - The DCQL query specifying which credentials and claims to select.
 * @property {JwkPrivateKey} deviceJwkPrivateKey - The device's private JWK for signing device authentication.
 * @property {SessionTranscript} sessionTranscript - The session transcript tuple structure for DeviceAuthentication.
 * @property {Map<string, unknown>} [nameSpaces] - Optional device nameSpaces to include. Defaults to an empty Map.
 * @property {Date} [now] - The current date and time for document verification. Defaults to `new Date()`.
 * @property {number} [clockSkew] - Acceptable clock skew in seconds for document verification. Defaults to `60`.
 */
interface BuildDeviceResponseParams {
  issuerSignedDocuments: Document[];
  query: DcqlQuery;
  deviceJwkPrivateKey: JwkPrivateKey;
  sessionTranscript: SessionTranscript;
  nameSpaces?: Map<string, unknown>;
  now?: Date;
  clockSkew?: number;
}

/**
 * Builds a device response (mdoc) from issuer-signed documents based on a DCQL query.
 *
 * @description
 * This function orchestrates the complete process of building a device response for mdoc:
 * 1. Selects documents and claims based on the DCQL query using {@link selectDocumentsClaimsByQuery}.
 * 2. Verifies each selected document's issuer-signed structure using {@link verifyIssuerSignedDocuments}.
 * 3. For each successfully verified document:
 *    - Extracts the `docType` and `issuerSigned` structure using {@link toIssuerSignedDocumentObject}.
 *    - Builds a device-signed structure using {@link buildDeviceSigned}.
 *    - Creates a complete Document with both issuer-signed and device-signed data.
 * 4. Groups documents by credential ID and creates an Mdoc structure for each credential.
 * 5. Returns a Map where keys are credential IDs and values are Mdoc structures.
 *
 * The resulting Mdoc structures include:
 * - Successfully verified and device-signed documents in the `documents` array.
 * - Any document verification errors in the `documentErrors` array.
 * - Status set to `MdocStatus.OK`.
 *
 * @param {BuildDeviceResponseParams} params - The parameters for building the device response.
 * @param {Document[]} params.issuerSignedDocuments - Array of issuer-signed documents to process.
 * @param {DcqlQuery} params.query - The DCQL query specifying which credentials and claims to select.
 * @param {JwkPrivateKey} params.deviceJwkPrivateKey - The device's private JWK for signing device authentication.
 * @param {SessionTranscript} params.sessionTranscript - The session transcript tuple structure for DeviceAuthentication.
 * @param {Map<string, unknown>} [params.nameSpaces] - Optional device nameSpaces to include. Defaults to an empty Map.
 * @param {Date} [params.now] - The current date and time for document verification. Defaults to `new Date()`.
 * @param {number} [params.clockSkew] - Acceptable clock skew in seconds for document verification. Defaults to `60`.
 *
 * @returns {Map<string, Mdoc>} A Map where keys are credential IDs and values are Mdoc structures containing:
 *   - `documents`: Array of successfully verified and device-signed documents.
 *   - `documentErrors`: Array of document errors for documents that failed verification.
 *   - `status`: Always set to `MdocStatus.OK`.
 *
 * @throws {Error}
 * Throws an error if no documents claims are selected (i.e., `selectDocumentsClaimsByQuery` returns `undefined`).
 *
 * @see {@link selectDocumentsClaimsByQuery} - For document and claim selection based on DCQL query.
 * @see {@link verifyIssuerSignedDocuments} - For document verification.
 * @see {@link buildDeviceSigned} - For device signature creation.
 * @see {@link toIssuerSignedDocumentObject} - For document structure extraction.
 * @see {@link createDocument} - For Document structure creation.
 * @see {@link createMdoc} - For Mdoc structure creation.
 * @see {@link DcqlQuery} - For DCQL query structure.
 * @see {@link SessionTranscript} - For session transcript structure.
 * @see {@link Mdoc} - For Mdoc structure details.
 *
 * @example
 * ```typescript
 * const issuerSignedDocuments: Document[] = [
 *   // ... issuer-signed document instances
 * ];
 *
 * const query: DcqlQuery = {
 *   credentials: [
 *     {
 *       id: 'credential-1',
 *       docType: 'org.iso.18013.5.1.mDL',
 *       claims: {
 *         'org.iso.18013.5.1': ['given_name', 'family_name'],
 *       },
 *     },
 *   ],
 * };
 *
 * const sessionTranscript: SessionTranscript = [null, null, handoverData];
 * const nameSpaces = new Map([['org.iso.18013.5.1', new Map([['claim', 'value']])]]);
 *
 * const deviceResponse = buildDeviceResponse({
 *   issuerSignedDocuments,
 *   query,
 *   deviceJwkPrivateKey,
 *   sessionTranscript,
 *   nameSpaces,
 *   now: new Date('2024-01-01T00:00:00Z'),
 *   clockSkew: 120, // 2 minutes
 * });
 *
 * // Process response by credential ID
 * deviceResponse.forEach((mdoc, credentialId) => {
 *   console.log(`Credential ${credentialId}:`);
 *   console.log(`  Documents: ${mdoc.get('documents')?.length || 0}`);
 *   console.log(`  Errors: ${mdoc.get('documentErrors')?.length || 0}`);
 * });
 * ```
 */
export const buildDeviceResponse = ({
  issuerSignedDocuments,
  query,
  deviceJwkPrivateKey,
  sessionTranscript,
  nameSpaces = new Map<string, unknown>(),
  now,
  clockSkew,
}: BuildDeviceResponseParams): Map<string, Mdoc> => {
  const selectedDocumentsClaims = selectDocumentsClaimsByQuery(
    issuerSignedDocuments,
    query
  );

  if (!selectedDocumentsClaims) {
    throw new Error('No documents claims selected');
  }

  const nameSpacesBytes = createTag24(nameSpaces);

  const deviceSignedDocuments = new Map(
    Array.from(selectedDocumentsClaims.entries()).map(
      ([credentialId, documentsClaims]) => {
        const { documents, documentErrors } = verifyIssuerSignedDocuments({
          issuerSignedDocuments: documentsClaims,
          now,
          clockSkew,
        });
        const deviceSignedDocuments = documents.map((document) => {
          const { docType, issuerSigned } =
            toIssuerSignedDocumentObject(document);
          const deviceSigned = buildDeviceSigned({
            sessionTranscript,
            docType,
            nameSpacesBytes,
            deviceJwkPrivateKey,
          });
          return createDocument([
            ['docType', docType],
            ['issuerSigned', issuerSigned],
            ['deviceSigned', deviceSigned],
          ]);
        });
        const mdoc: Mdoc = createMdoc([
          ['version', '1.0'],
          ['documents', deviceSignedDocuments],
          ['documentErrors', documentErrors],
          ['status', MdocStatus.OK],
        ]);
        return [credentialId, mdoc];
      }
    )
  );

  return deviceSignedDocuments;
};
