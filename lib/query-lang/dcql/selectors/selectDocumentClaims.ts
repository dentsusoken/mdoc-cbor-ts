import { createDocument, Document } from '@/schemas/mdoc/Document';
import { DcqlCredential } from '../schemas/DcqlCredential';
import { Tag } from 'cbor-x';
import { enrichIssuerSignedItems } from '@/query-lang/common/enrichIssuerSignedItems';
import { createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { selectTag } from './selectTag';

export const selectDocumentClaims = (
  document: Document,
  credential: DcqlCredential
): Document | undefined => {
  if (document.get('docType') !== credential.meta.doctype_value) {
    return undefined;
  }

  const issuerSigned = document.get('issuerSigned');
  if (!issuerSigned) {
    return undefined;
  }

  if (!credential.claims) {
    const newIssuerSigned = createIssuerSigned([
      ['nameSpaces', new Map()],
      ['issuerAuth', issuerSigned.get('issuerAuth')!],
    ]);

    return createDocument([
      ['docType', document.get('docType')!],
      ['issuerSigned', newIssuerSigned],
    ]);
  }

  const nameSpaces = issuerSigned.get('nameSpaces');
  if (!nameSpaces) {
    return undefined;
  }

  const claimMap = new Map<string, Tag>();

  for (const claim of credential.claims) {
    const tag = selectTag(
      normalItems,
      ageOverTrueItems,
      ageOverFalseItems,
      claim.path
    );
  }

  const selectedNameSpaces = new Map<string, Tag[]>();

  for (const [nameSpace, issuerSignedItemTags] of nameSpaces.entries()) {
    const { normalItems, ageOverTrueItems, ageOverFalseItems } =
      enrichIssuerSignedItems(issuerSignedItemTags);
  }

  return document.claims.filter((claim) => {
    return claim.id === credential.id;
  });
};
