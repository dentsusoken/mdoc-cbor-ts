import { Document } from '@/schemas/mdoc/Document';
import { MDoc } from '@/schemas/mdoc/MDoc';

/**
 * Parameters for building an issuer Mobile Document (MDoc)
 */
export type BuildIssuerMDocParams = {
  documents: Document[];
};

/**
 * Builds an issuer Mobile Document (MDoc) with the provided documents
 *
 * @param params - The parameters for building the MDoc
 * @param params.documents - Array of documents to include in the MDoc
 * @returns The constructed MDoc with version 1.0 and status 0
 */
export const buildIssuerMDoc = ({ documents }: BuildIssuerMDocParams): MDoc => {
  return {
    version: '1.0',
    documents,
    status: 0,
  };
};
