import { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { Tag } from 'cbor-x';

export const buildIssuerSignedItemTag = (
  issuerSignedItem: IssuerSignedItem
): Tag => {
  return createTag24({
    digestID: issuerSignedItem.digestID,
    random: issuerSignedItem.random,
    elementIdentifier: issuerSignedItem.elementIdentifier,
    elementValue: issuerSignedItem.elementValue,
  });
};
