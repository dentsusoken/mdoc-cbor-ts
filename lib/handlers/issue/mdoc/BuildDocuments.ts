import { COSEKey } from '@auth0/cose';
import { Document } from '@/schemas/mdoc/Document';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import {
  DocTypesRecord,
  docTypeNameSpaceElementsRecordSchema,
} from '@/schemas/record/DocTypeNameSpaceElementsRecord';
import { buildIssuerNameSpaces } from './buildIssuerNameSpaces';
import { buildIssuerAuth } from '../mso';

type BuildDocumentsParams = {
  docTypesRecord: DocTypesRecord;
  devicePublicKey: COSEKey;
  issuerPrivateKey: COSEKey;
  x5c: Uint8Array[];
  digestAlgorithm: DigestAlgorithm;
  validFrom: number;
  validUntil: number;
  expectedUpdate?: number;
};

export const createDocuments = async ({
  docTypesRecord,
  devicePublicKey,
  issuerPrivateKey,
  x5c,
  digestAlgorithm,
  validFrom,
  validUntil,
  expectedUpdate,
}: BuildDocumentsParams) => {
  docTypesRecord = docTypeNameSpaceElementsRecordSchema.parse(docTypesRecord);

  const documents = await Promise.all(
    Object.entries(docTypesRecord).map(async ([docType, nameSpacesRecord]) => {
      const nameSpaces = buildIssuerNameSpaces(nameSpacesRecord);
      const issuerAuth = await buildIssuerAuth({
        docType,
        nameSpaces,
        devicePublicKey,
        digestAlgorithm,
        validFrom,
        validUntil,
        expectedUpdate,
        issuerPrivateKey,
        x5c,
      });
      const document: Document = {
        docType,
        issuerSigned: {
          nameSpaces,
          issuerAuth,
        },
        deviceSigned: await buildDeviceSigned(privateKey),
      };
      return document;
    })
  );
  return documents;
};

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
