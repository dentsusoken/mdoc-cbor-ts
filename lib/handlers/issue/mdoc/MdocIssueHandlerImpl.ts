import { COSEKey } from '@auth0/cose';
import { X509Adapter } from '../../../adapters/X509Adapter';
import { Configuration } from '../../../conf/Configuration';
import { DeviceResponse, Document } from '../../../schemas/mdoc';
import { buildProtectedHeaders } from '../common';
import { MSOIssueHandlerImpl } from '../mso';
import { createDeviceSignedBuilder } from './BuildDeviceSigned';
import { createDocumentsBuilder } from './BuildDocuments';
import { createIssuerNameSpacesBuilder } from './BuildIssuerNameSpaces';
import { MdocData, MdocIssueHandler } from './MdocIssueHandler';

export class MdocIssueHandlerImpl implements MdocIssueHandler {
  #x509Adapter: X509Adapter;
  issue: (data: MdocData, deviceKey: COSEKey) => Promise<DeviceResponse>;

  constructor(configuration: Configuration, x509Adapter: X509Adapter) {
    this.#x509Adapter = x509Adapter;
    const issuerNameSpacesBuilder = createIssuerNameSpacesBuilder({
      configuration,
    });
    const buildDeviceSigned = createDeviceSignedBuilder({
      buildProtectedHeaders: buildProtectedHeaders,
    });

    const msoIssueHandler = new MSOIssueHandlerImpl(configuration, x509Adapter);
    const documentsBuilder = createDocumentsBuilder({
      buildIssuerNameSpaces: issuerNameSpacesBuilder,
      buildDeviceSigned: buildDeviceSigned,
      msoIssueHandler: msoIssueHandler,
    });
    this.issue = async (data, deviceKey) => {
      const documents = await documentsBuilder(
        data,
        deviceKey,
        this.#x509Adapter.privateKey
      );
      if (!documents || documents.length === 0) {
        throw new Error('No documents to issue');
      }
      const deviceResponse: DeviceResponse = {
        version: '1.0',
        documents: documents as [Document, ...Document[]],
        status: 0,
      };
      return deviceResponse;
    };
  }
}
