import { Tag } from 'cbor-x';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import {
  NameSpaceElementsRecord,
  nameSpaceElementsRecordSchema,
} from '@/schemas/record/NameSpaceElementsRecord';
import { NameSpace } from '@/schemas/common/NameSpace';
import { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { RandomBytes } from 'noble-curves-extended';

/**
 * Builds issuer namespaces from a record of data elements
 * @description
 * Transforms a `NameSpaceElementsRecord` into `IssuerNameSpaces` by creating CBOR Tag 24
 * wrapped issuer-signed items for each data element. Each item includes a unique
 * digest ID (starting from 0 within each namespace), random bytes, element identifier,
 * and element value.
 *
 * The function validates the input data, generates cryptographically secure random
 * values using the provided random bytes function, and creates the hierarchical
 * structure required for mdoc issuer namespaces.
 *
 * @param nameSpacesElements - The namespace record containing data elements to be signed
 * @param randomBytes - A cryptographically secure random bytes generator function that accepts a length and returns a Uint8Array
 * @returns A Map of namespaces to arrays of CBOR Tag 24 wrapped issuer-signed items
 * @throws {Error} When a namespace contains no elements
 * @throws {Error} When no namespaces are provided
 * @throws {ZodError} When the input data fails validation
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
 * // Returns Map<NameSpace, Tag[]> with CBOR Tag 24 wrapped items
 * ```
 */
export const buildIssuerNameSpaces = (
  nameSpacesElements: NameSpaceElementsRecord,
  randomBytes: RandomBytes
): IssuerNameSpaces => {
  nameSpacesElements = nameSpaceElementsRecordSchema.parse(nameSpacesElements);

  const issuerNameSpaces: IssuerNameSpaces = new Map<NameSpace, Tag[]>();

  Object.entries(nameSpacesElements).forEach(([nameSpace, elements]) => {
    const issuerSignedItemTags: Tag[] = [];

    Object.entries(elements).forEach(([elementIdentifier, elementValue]) => {
      const random = randomBytes(32);
      // Keys must be in lexicographic order for CBOR canonical form
      // Order: digestID, elementIdentifier, elementValue, random
      const issuerSignedItem: IssuerSignedItem = {
        digestID: issuerSignedItemTags.length,
        elementIdentifier,
        elementValue,
        random,
      };
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
