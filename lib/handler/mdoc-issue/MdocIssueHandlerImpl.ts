import { encode } from 'cbor-x';
import { EncodedMdoc } from '../../schemas/mdocSchema';
import { MsoIssueHandler } from '../mso-issue';
import {
  createDefaultDocumentsGenerator,
  DocumentData,
  DocumentsGenerator,
} from './DocumentGenerator';
import { MdocIssueHandler } from './MdocIssueHandler';
import {
  createDefaultNameSpacesGenerator,
  NameSpacesGenerator,
} from './NameSpacesGenerator';
import { CryptoConfig } from '../../conf';

export type MdocIssuerConfig = Pick<CryptoConfig, 'SALT_LENGTH'>;

export type MdocIssueHandlerOpt = {
  nameSpacesGenerator?: NameSpacesGenerator;
  documentsGenerator?: DocumentsGenerator;
};

export class MdocIssueHandlerImpl implements MdocIssueHandler {
  #msoIssuerHandler: MsoIssueHandler;
  #nameSpacesGenerator: NameSpacesGenerator;
  #documentsGenerator: DocumentsGenerator;
  #mdocIssuerConfig: MdocIssuerConfig;

  constructor(
    msoIssuerHandler: MsoIssueHandler,
    mdocIssuerConfig: MdocIssuerConfig,
    option: MdocIssueHandlerOpt = {}
  ) {
    this.#msoIssuerHandler = msoIssuerHandler;
    this.#mdocIssuerConfig = mdocIssuerConfig;
    this.#nameSpacesGenerator =
      option.nameSpacesGenerator ??
      createDefaultNameSpacesGenerator(mdocIssuerConfig);
    this.#documentsGenerator =
      option.documentsGenerator ??
      createDefaultDocumentsGenerator(
        this.#msoIssuerHandler,
        this.#nameSpacesGenerator
      );
  }

  async issue(
    data: DocumentData['data'] | DocumentData[],
    docType: string,
    encoding: 'raw'
  ): Promise<Buffer>;
  async issue(
    data: DocumentData['data'] | DocumentData[],
    docType: string,
    encoding: 'hex' | 'base64' | 'base64url'
  ): Promise<string>;
  async issue(
    data: DocumentData['data'] | DocumentData[],
    docType: string,
    encoding: 'raw' | 'hex' | 'base64' | 'base64url'
  ): Promise<string | Buffer> {
    const documents = await this.#documentsGenerator(
      Array.isArray(data) ? data : [{ docType, data }]
    );

    const mdoc: EncodedMdoc = {
      version: '1.0',
      status: 0,
      documents,
    };

    const encoded = encode(mdoc);
    return encoding === 'raw'
      ? encoded
      : encoding === 'hex'
      ? encoded.toString('hex')
      : encoding === 'base64'
      ? encoded.toString('base64')
      : encoded.toString('base64url');
  }
}
