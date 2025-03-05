import { COSEKey } from '@auth0/cose';
import { Document } from '../../../schemas/mdoc';
import { CreateBuilderFunction } from '../CreateBuilder';
import { MSOIssueHandler } from '../mso';
import { BuildDeviceSigned } from './BuildDeviceSigned';
import { BuildIssuerNameSpaces } from './BuildIssuerNameSpaces';
import { MdocData } from './MdocIssueHandler';

export type BuildDocuments = (
  data: MdocData,
  deviceKey: COSEKey,
  privateKey: COSEKey
) => Promise<Document[]>;

export type CreateDocumentsBuilderParams = {
  buildIssuerNameSpaces: BuildIssuerNameSpaces;
  buildDeviceSigned: BuildDeviceSigned;
  msoIssueHandler: MSOIssueHandler;
};

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
            // @ts-ignore
            // TODO: 型をちゃんとつける
            issuerAuth: issuerAuth.getContentForEncoding(),
          },
          deviceSigned: await buildDeviceSigned(privateKey),
        };
        return document;
      })
    );
    return documents;
  };
