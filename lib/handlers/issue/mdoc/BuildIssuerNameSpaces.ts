import { Tag } from 'cbor-x';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import {
  NameSpaceElementsRecord,
  nameSpaceElementsRecordSchema,
} from '@/schemas/record/NameSpaceElementsRecord';
import { NameSpace } from '@/schemas/common/NameSpace';
import { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';

/**
 * Builds issuer namespaces from a record of data elements
 * @description
 * Transforms a `NameSpacesRecord` into `IssuerNameSpaces` by creating CBOR Tag 24
 * wrapped issuer-signed items for each data element. Each item includes a unique
 * digest ID, random bytes, element identifier, and element value.
 *
 * The function validates the input data, generates cryptographically secure random
 * values, and creates the hierarchical structure required for mdoc issuer namespaces.
 *
 * @param nameSpacesRecord - The namespace record containing data elements to be signed
 * @returns A Map of namespaces to arrays of CBOR Tag 24 wrapped issuer-signed items
 * @throws {Error} When a namespace contains no elements
 * @throws {Error} When no namespaces are provided
 * @throws {ZodError} When the input data fails validation
 *
 * @example
 * ```typescript
 * const data = {
 *   'org.iso.18013.5.1': {
 *     'given_name': 'John',
 *     'family_name': 'Doe'
 *   }
 * };
 * const issuerNameSpaces = buildIssuerNameSpaces(data);
 * // Returns Map<NameSpace, Tag[]> with CBOR Tag 24 wrapped items
 * ```
 */
export const buildIssuerNameSpaces = (
  nameSpacesRecord: NameSpaceElementsRecord
): IssuerNameSpaces => {
  nameSpacesRecord = nameSpaceElementsRecordSchema.parse(nameSpacesRecord);

  const issuerNameSpaces: IssuerNameSpaces = new Map<NameSpace, Tag[]>();
  let digestID = 0;

  Object.entries(nameSpacesRecord).forEach(([nameSpace, elements]) => {
    const issuerSignedItemTags: Tag[] = [];

    Object.entries(elements).forEach(([elementIdentifier, elementValue]) => {
      const random = crypto.getRandomValues(new Uint8Array(32));
      const issuerSignedItem: IssuerSignedItem = {
        digestID: digestID++,
        random,
        elementIdentifier,
        elementValue,
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
