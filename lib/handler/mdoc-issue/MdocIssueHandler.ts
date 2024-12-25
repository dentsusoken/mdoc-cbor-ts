import { DocumentData } from './DocumentGenerator';

export interface MdocIssueHandler {
  issue(
    data: DocumentData['data'] | DocumentData[],
    docType: string,
    encoding: 'raw'
  ): Promise<Buffer>;
  issue(
    data: DocumentData['data'] | DocumentData[],
    docType: string,
    encoding: 'hex' | 'base64' | 'base64url'
  ): Promise<string>;
}
