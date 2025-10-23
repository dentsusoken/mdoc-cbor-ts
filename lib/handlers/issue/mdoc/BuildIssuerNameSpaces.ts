import { Tag } from 'cbor-x';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import {
  createIssuerSignedItem,
  IssuerSignedItem,
} from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { RandomBytes } from '@/types';

/**
 * Builds IssuerNameSpaces from a NameSpaceElements.
 *
 * @description
 * Converts a validated {@link NameSpaceElements} into an {@link IssuerNameSpaces} structure by generating a CBOR Tag 24 wrapped issuer-signed item for each data element in each namespace. Each issuer-signed item includes a unique digest ID (incremented per element within a namespace), a cryptographically secure random value, the element identifier, and the element value. The function ensures the input is valid, generates random bytes for each item, and returns a Map of namespaces to arrays of Tag 24 issuer-signed items.
 *
 * @param {NameSpaceElements} nameSpaceElements - The record mapping each namespace to its data elements to be signed.
 * @param {RandomBytes} randomBytes - A function that generates cryptographically secure random bytes of the specified length.
 * @returns {IssuerNameSpaces} A Map where each key is a namespace and each value is an array of CBOR Tag 24 issuer-signed items.
 * @throws {z.ZodError} If the input data does not conform to the NameSpaceElements schema.
 * @throws {Error} If a namespace contains no elements or if no namespaces are provided.
 *
 * @example
 * ```typescript
 * import { randomBytes } from '@noble/hashes/utils';
 *
 * const data = {
 *   'org.iso.18013.5.1': {
 *     'given_name': 'John',
 *     'family_name': 'Doe'
 *   }
 * };
 * const issuerNameSpaces = buildIssuerNameSpaces(data, randomBytes);
 * // issuerNameSpaces is a Map<NameSpace, Tag[]> with CBOR Tag 24 wrapped items
 * ```
 */
export const buildIssuerNameSpaces = (
  nameSpaceElements: Record<string, Record<string, unknown>>,
  randomBytes: RandomBytes
): IssuerNameSpaces => {
  const issuerNameSpaces: IssuerNameSpaces = new Map<string, Tag[]>();

  Object.entries(nameSpaceElements).forEach(([nameSpace, elements]) => {
    const issuerSignedItemTags: Tag[] = [];

    Object.entries(elements).forEach(([elementIdentifier, elementValue]) => {
      const random = randomBytes(32);
      // Keys must be in lexicographic order for CBOR canonical form
      // Order: digestID, elementIdentifier, elementValue, random
      const issuerSignedItem: IssuerSignedItem = createIssuerSignedItem([
        ['digestID', issuerSignedItemTags.length],
        ['random', random],
        ['elementIdentifier', elementIdentifier],
        ['elementValue', elementValue],
      ]);
      const tag = createTag24(issuerSignedItem);
      issuerSignedItemTags.push(tag);
    });

    if (issuerSignedItemTags.length === 0) {
      throw new Error(`No issuer signed items for namespace ${nameSpace}`);
    }

    issuerNameSpaces.set(nameSpace, issuerSignedItemTags);
  });

  if (issuerNameSpaces.size === 0) {
    throw new Error(`No issuer name spaces`);
  }

  return issuerNameSpaces;
};
