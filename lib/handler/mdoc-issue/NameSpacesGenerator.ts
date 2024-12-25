import { TypedTag } from '../../cbor';
import {
  DisclosureMapItem,
  RawNameSpaces,
  EncodedNameSpaces,
} from '../../schemas';
import { MdocIssuerConfig } from './MdocIssueHandlerImpl';

export type NameSpacesGeneratorResult = {
  raw: RawNameSpaces;
  encoded: EncodedNameSpaces;
};

export type NameSpacesGenerator = (
  data: Record<string, Record<string, unknown>>
) => Promise<NameSpacesGeneratorResult>;

export const createDefaultNameSpacesGenerator = (
  config: MdocIssuerConfig
): NameSpacesGenerator => {
  return async (data) => {
    const raw: RawNameSpaces = {};
    const encoded: EncodedNameSpaces = {};

    let digestID = 0;

    for (const [namespaceId, values] of Object.entries(data)) {
      raw[namespaceId] = [];
      encoded[namespaceId] = [];
      Object.entries(values).map(([key, value]) => {
        const disclosureMapItem: DisclosureMapItem = {
          random: Buffer.from(
            crypto.getRandomValues(new Uint8Array(config.SALT_LENGTH))
          ),
          digestID: digestID,
          elementIdentifier: key,
          elementValue: value,
        };
        const tag = new TypedTag(disclosureMapItem, 24);
        raw[namespaceId].push(tag);
        encoded[namespaceId].push(tag.encode());
        digestID++;
      });
    }
    return { raw, encoded };
  };
};
