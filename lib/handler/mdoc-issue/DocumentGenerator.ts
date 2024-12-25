import { encode } from 'cbor-x';
import { EncodedDocument } from '../../schemas/documentSchema';
import { MsoIssueHandler } from '../mso-issue';
import { NameSpacesGenerator } from './NameSpacesGenerator';

export type DocumentData = {
  docType: string;
  data: Record<string, Record<string, unknown>>;
};

export type DocumentsGenerator = (
  data: DocumentData[]
) => Promise<EncodedDocument[]>;

export const createDefaultDocumentsGenerator = (
  msoIssuerHandler: MsoIssueHandler,
  nameSpacesGenerator: NameSpacesGenerator
): DocumentsGenerator => {
  return async (data: DocumentData[]) => {
    const documents: EncodedDocument[] = [];
    for (const item of data) {
      const nameSpaces = await nameSpacesGenerator(item.data);
      const issuerAuth = await msoIssuerHandler.issue(nameSpaces);
      documents.push({
        docType: item.docType,
        issuerSigned: {
          nameSpaces,
          issuerAuth: issuerAuth.encode(),
        },
        deviceSigned: {},
      });
    }

    return documents;
  };
};
