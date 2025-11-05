import { Tag } from 'cbor-x';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import {
  createIssuerSignedItem,
  IssuerSignedItem,
} from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { RandomBytes } from '@/types';

/**
 * Constructs the IssuerNameSpaces map structure for mdoc data, producing a
 * Map from namespace string to a list of CBOR Tag 24-wrapped IssuerSignedItem objects.
 *
 * Each IssuerSignedItem encodes the details of a single mdoc data element, wrapped as a CBOR Tag 24.
 *
 * @param nameSpaces - Map where each key is a namespace string (e.g., 'org.iso.18013.5.1'),
 *   and each value is a Map of element identifiers to their corresponding element values.
 * @param randomBytes - A function that returns a Uint8Array of cryptographically secure random bytes,
 *   used to populate the 'random' field of each IssuerSignedItem.
 *   Must accept a single argument, the number of bytes to generate (e.g., 32).
 * @returns {IssuerNameSpaces} A Map<string, Tag[]> where each key is the namespace string,
 *   and each value is an array of CBOR Tag 24 (Tag) objects—in canonical order—
 *   each wrapping an IssuerSignedItem for each namespace element.
 *
 * @throws {Error} If any namespace contains no elements, or if nameSpaces is empty.
 *
 * @see IssuerSignedItem
 * @see IssuerNameSpaces
 * @see createIssuerSignedItem
 * @see createTag24
 *
 * @example
 * const issuerNameSpaces = buildIssuerNameSpaces(
 *   new Map([
 *     ["org.iso.18013.5.1", new Map([
 *       ["given_name", "Alice"],
 *       ["family_name", "Smith"]
 *     ])]
 *   ]),
 *   (length) => crypto.getRandomValues(new Uint8Array(length))
 * );
 */
export const buildIssuerNameSpaces = (
  nameSpaces: Map<string, Map<string, unknown>>,
  randomBytes: RandomBytes
): IssuerNameSpaces => {
  const issuerNameSpaces: IssuerNameSpaces = new Map<string, Tag[]>();

  Array.from(nameSpaces.entries()).forEach(([nameSpace, elements]) => {
    const issuerSignedItemTags: Tag[] = [];

    Array.from(elements.entries()).forEach(
      ([elementIdentifier, elementValue]) => {
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
      }
    );

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
