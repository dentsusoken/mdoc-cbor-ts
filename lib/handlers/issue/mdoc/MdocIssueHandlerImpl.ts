import { COSEKey } from '@auth0/cose';
import { X509Adapter } from '../../../adapters/X509Adapter';
import { Configuration } from '../../../conf/Configuration';
import { DeviceResponse, Document } from '../../../schemas/mdoc';
import { buildProtectedHeaders } from '../cose';
import { MSOIssueHandlerImpl } from '../mso';
import { createDeviceSignedBuilder } from './BuildDeviceSigned';
import { createDocumentsBuilder } from './BuildDocuments';
import { createIssuerNameSpacesBuilder } from './buildIssuerNameSpaces';
import { MdocData, MdocIssueHandler } from './MdocIssueHandler';

/**
 * Implementation of the MDOC issue handler
 * @description
 * A class that implements the MDOC issue process. It creates MDOCs with
 * issuer-signed and device-signed data using the provided configuration
 * and X.509 adapter.
 *
 * @example
 * ```typescript
 * const handler = new MdocIssueHandlerImpl(configuration, x509Adapter);
 * const deviceResponse = await handler.issue(data, deviceKey);
 * ```
 */
export class MdocIssueHandlerImpl implements MdocIssueHandler {
  #x509Adapter: X509Adapter;
  issue: (data: MdocData, deviceKey: COSEKey) => Promise<DeviceResponse>;

  /**
   * Creates a new MDOC issue handler
   * @param configuration - Configuration settings for the MDOC
   * @param x509Adapter - Adapter for handling X.509 certificates and keys
   */
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
