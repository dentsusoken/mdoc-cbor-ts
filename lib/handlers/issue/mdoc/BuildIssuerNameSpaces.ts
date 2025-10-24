import { Tag } from 'cbor-x';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import {
  createIssuerSignedItem,
  IssuerSignedItem,
} from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { RandomBytes } from '@/types';

/**
 * Builds an IssuerNameSpaces structure
 * from Record<NameSapce, Record<DataElementIdentifier, DataElementValue>>.
 *
 * @description
 * Takes a record mapping each namespace string to an object of data elements (identifier-value pairs),
 * and produces an {@link IssuerNameSpaces} structure (a Map of namespaces to arrays of CBOR Tag 24 issuer-signed items).
 * For each element in each namespace, creates a CBOR Tag 24-wrapped IssuerSignedItem:
 *   - Each IssuerSignedItem includes a unique digestID (its index in the namespace array), a secure random value (32 bytes),
 *     the element identifier, and the element value.
 * The function verifies that there is at least one element per namespace and at least one namespace,
 * and throws if these invariants are not met.
 *
 * @param {Record<string, Record<string, unknown>>} nameSpaceElements - Object mapping namespaces to data element identifier-value objects.
 * @param {RandomBytes} randomBytes - Function generating cryptographically secure random bytes of given length.
 * @returns {IssuerNameSpaces} A Map from namespace string to array of CBOR Tag 24 issuer-signed items.
 * @throws {Error} If a namespace contains no elements or no namespaces are provided.
 *
 * @example
 * import { randomBytes } from '@noble/hashes/utils';
 *
 * const data = {
 *   'org.iso.18013.5.1': {
 *     'given_name': 'John',
 *     'family_name': 'Doe'
 *   }
 * };
 * const issuerNameSpaces = buildIssuerNameSpaces(data, randomBytes);
 * // issuerNameSpaces is a Map<string, Tag[]> with Tag 24 items per element
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
