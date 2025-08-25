import { COSEKey } from '@auth0/cose';
import { Document } from '../../../schemas/mdoc';
import { CreateBuilderFunction } from '../CreateBuilder';
import { MSOIssueHandler } from '../mso';
import { BuildDeviceSigned } from './BuildDeviceSigned';
import { BuildIssuerNameSpaces } from './buildIssuerNameSpaces';
import { MdocData } from './MdocIssueHandler';

/**
 * Type definition for building documents
 * @description
 * A function type that creates a collection of documents from the provided data.
 * Each document includes issuer-signed and device-signed data.
 */
export type BuildDocuments = (
  data: MdocData,
  deviceKey: COSEKey,
  privateKey: COSEKey
) => Promise<Document[]>;

/**
 * Parameters for creating a documents builder
 * @description
 * Configuration and dependencies required to create a builder function
 * for documents.
 */
export type CreateDocumentsBuilderParams = {
  /** Function to build issuer name spaces */
  buildIssuerNameSpaces: BuildIssuerNameSpaces;
  /** Function to build device-signed data */
  buildDeviceSigned: BuildDeviceSigned;
  /** Handler for issuing MSOs */
  msoIssueHandler: MSOIssueHandler;
};

/**
 * Creates a function for building documents
 * @description
 * Returns a function that creates a collection of documents from the provided
 * data. The function processes each document type, creating issuer-signed
 * and device-signed data for each.
 *
 * @example
 * ```typescript
 * const builder = createDocumentsBuilder({
 *   buildIssuerNameSpaces,
 *   buildDeviceSigned,
 *   msoIssueHandler
 * });
 * const documents = await builder(data, deviceKey, privateKey);
 * ```
 */
export const createDocumentsBuilder: CreateBuilderFunction<
  CreateDocumentsBuilderParams,
  BuildDocuments
> =
  ({ buildIssuerNameSpaces, buildDeviceSigned, msoIssueHandler }) =>
  async (data, deviceKey, privateKey) => {
    const documents = await Promise.all(
      Object.entries(data).map(async ([docType, nameSpaceDate]) => {
        const issuerNameSpaces = buildIssuerNameSpaces(nameSpaceDate);
        const issuerAuth = await msoIssueHandler.issue(
          docType,
          issuerNameSpaces,
          deviceKey
        );
        const document: Document = {
          docType,
          issuerSigned: {
            nameSpaces: issuerNameSpaces,
            issuerAuth: issuerAuth,
          },
          deviceSigned: await buildDeviceSigned(privateKey),
        };
        return document;
      })
    );
    return documents;
  };
