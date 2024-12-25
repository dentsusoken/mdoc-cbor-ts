import { encode } from 'cbor-x';
import { TypedTag } from '../../cbor';
import { DisclosureMapItem, EncodedNameSpaces } from '../../schemas';
import { MdocIssuerConfig } from './MdocIssueHandlerImpl';

export type NameSpacesGenerator = (
  data: Record<string, Record<string, unknown>>
) => Promise<EncodedNameSpaces>;

export const createDefaultNameSpacesGenerator = (
  config: MdocIssuerConfig
): NameSpacesGenerator => {
  return async (data) => {
    const nameSpaces: EncodedNameSpaces = {};

    let digestID = 0;

    for (const [namespaceId, values] of Object.entries(data)) {
      nameSpaces[namespaceId] = [];
      Object.entries(values).map(([key, value]) => {
        const disclosureMapItem: DisclosureMapItem = {
          random: Buffer.from(
            crypto.getRandomValues(new Uint8Array(config.SALT_LENGTH))
          ),
          digestID: digestID,
          elementIdentifier: key,
          elementValue: value,
        };
        const tag = new TypedTag(encode(disclosureMapItem), 24);
        nameSpaces[namespaceId].push(tag);
        digestID++;
      });
    }
    return nameSpaces;
  };
};
