import { COSEKey } from '@auth0/cose';
import { Document } from '@/schemas/mdoc/Document';
import { IssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { NameSpaceElementIdentifiers } from '@/schemas/record/NameSpaceElementIdentifiers';
import { extractSelectedIssuerNameSpaces } from './extractSelectedIssuerNameSpaces';
import { buildDeviceSigned } from './buildDeviceSigned';
import { mobileSecurityObjectSchema } from '@/schemas/mso';
import { decodeCbor } from '@/cbor';
import { mobileSecurityObjectBytesSchema } from '@/schemas/mso/MobileSecurityObjectBytes';

/**
 * Parameters for building an mdoc document
 * @description
 * Configuration object containing the issuer-signed data, requested element identifiers,
 * and device private key needed to construct a complete mdoc document.
 */
type BuildDocumentParams = {
  /** The issuer-signed data containing namespaces and issuer authentication */
  issuerSigned: IssuerSigned;
  /** Record mapping namespace names to arrays of requested element identifiers */
  nameSpacesElementIdentifiers: NameSpaceElementIdentifiers;
  /** The device's private key used for device authentication */
  devicePrivateKey: COSEKey;
};

/**
 * Builds a complete mdoc document from issuer-signed data and device key
 * @description
 * Creates a complete mdoc document by:
 * 1. Filtering the issuer-signed namespaces to include only requested elements
 * 2. Extracting the document type from the Mobile Security Object
 * 3. Creating device-signed data with the provided device private key
 * 4. Combining all components into a complete Document structure
 *
 * The function modifies the provided `issuerSigned` object by filtering its
 * namespaces to contain only the elements specified in `nameSpacesElementIdentifiers`.
 *
 * @param params - Configuration object containing issuer data and device key
 * @returns Promise resolving to a complete mdoc Document
 *
 * @example
 * ```typescript
 * const document = await buildDocument({
 *   issuerSigned: validIssuerSignedData,
 *   nameSpacesElementIdentifiers: {
 *     'org.iso.18013.5.1': ['given_name', 'family_name']
 *   },
 *   devicePrivateKey: deviceKey
 * });
 * // Returns a Document with filtered namespaces and device signature
 * ```
 *
 * @throws {Error} When Mobile Security Object parsing fails
 * @throws {Error} When device signing fails
 *
 * @see {@link IssuerSigned}
 * @see {@link NameSpaceElementIdentifiers}
 * @see {@link Document}
 * @see {@link extractSelectedIssuerNameSpaces}
 * @see {@link buildDeviceSigned}
 */
export const buildDocument = async ({
  issuerSigned,
  nameSpacesElementIdentifiers,
  devicePrivateKey,
}: BuildDocumentParams): Promise<Document> => {
  issuerSigned.nameSpaces = extractSelectedIssuerNameSpaces(
    issuerSigned.nameSpaces,
    nameSpacesElementIdentifiers
  );

  const payload = issuerSigned.issuerAuth[2];
  const msoTag24 = mobileSecurityObjectBytesSchema.parse(decodeCbor(payload));
  const msoMap = decodeCbor(msoTag24.value);
  const mso = mobileSecurityObjectSchema.parse(msoMap);
  const docType = mso.docType;

  const deviceSigned = await buildDeviceSigned(devicePrivateKey);

  const document: Document = {
    docType,
    issuerSigned,
    deviceSigned,
  };

  return document;
};
