import { decodeCbor } from '@/cbor/codec';
import { Tag } from 'cbor-x';
import {
  IssuerNameSpaces,
  issuerNameSpacesSchema,
} from '@/schemas/mdoc/IssuerNameSpaces';
import { issuerSignedItemSchema } from '@/schemas/mdoc/IssuerSignedItem';
import {
  nameSpaceElementIdentifiersRecordSchema,
  type NameSpaceElementIdentifiersRecord,
} from '@/schemas/record/NameSpaceElementIdentifiersRecord';

/**
 * Extracts selected issuer-signed namespaces based on requested element identifiers
 * @description
 * Filters the provided `IssuerNameSpaces` to include only those namespaces and elements
 * that match the requested element identifiers specified in `nameSpaceElementIdentities`.
 *
 * This function is used during the mDoc issuance process to create a subset of issuer-signed
 * data that contains only the elements requested by the device or application.
 *
 * The function:
 * 1. Validates the input `nameSpaces` using the schema
 * 2. Iterates through each namespace in the issuer-signed data
 * 3. Checks if the namespace exists in the requested identities
 * 4. For matching namespaces, filters elements to include only those with requested identifiers
 * 5. Returns a new `IssuerNameSpaces` Map containing only the selected data
 *
 * @param nameSpaces - The complete issuer-signed namespaces containing all available data elements
 * @param nameSpaceElementIdentities - A record mapping namespace names to arrays of requested element identifiers
 * @returns A filtered `IssuerNameSpaces` Map containing only the requested namespaces and elements
 *
 * @example
 * ```typescript
 * const issuerNameSpaces = new Map([
 *   ['org.iso.18013.5.1', [
 *     createTag24({ digestID: 0, random: new Uint8Array(32), elementIdentifier: 'given_name', elementValue: 'John' }),
 *     createTag24({ digestID: 1, random: new Uint8Array(32), elementIdentifier: 'family_name', elementValue: 'Doe' }),
 *     createTag24({ digestID: 2, random: new Uint8Array(32), elementIdentifier: 'age', elementValue: 30 })
 *   ]]
 * ]);
 *
 * const requestedIdentities = {
 *   'org.iso.18013.5.1': ['given_name', 'family_name']
 * };
 *
 * const selected = extractSelectedIssuerNameSpaces(issuerNameSpaces, requestedIdentities);
 * // Returns a Map with only 'given_name' and 'family_name' elements for 'org.iso.18013.5.1'
 * ```
 *
 * @throws {z.ZodError} When the input `nameSpaces` fails schema validation
 * @throws {Error} When CBOR decoding of issuer-signed item bytes fails
 *
 * @see {@link IssuerNameSpaces}
 * @see {@link NameSpaceElementIdentitiesRecord}
 * @see {@link issuerSignedItemSchema}
 */
export const extractSelectedIssuerNameSpaces = (
  nameSpaces: IssuerNameSpaces,
  nameSpaceElementIdentities: NameSpaceElementIdentifiersRecord
): IssuerNameSpaces => {
  nameSpaces = issuerNameSpacesSchema.parse(nameSpaces);
  nameSpaceElementIdentities = nameSpaceElementIdentifiersRecordSchema.parse(
    nameSpaceElementIdentities
  );

  const result = new Map<string, Tag[]>();

  for (const [nameSpace, issuerSignedItemBytesArray] of nameSpaces.entries()) {
    // Find the namespace in any document type's requested identities
    const requestedIdentities = nameSpaceElementIdentities[nameSpace];

    if (!requestedIdentities) {
      continue; // Skip namespaces not in any request
    }

    const selected = issuerSignedItemBytesArray.filter(
      (issuerSignedItemBytes) => {
        const issuerSignedItem = issuerSignedItemSchema.parse(
          decodeCbor(issuerSignedItemBytes.value)
        );
        const elementIdentifier = issuerSignedItem.elementIdentifier;

        // Check if this element identifier is in the requested list
        return requestedIdentities.some((id) => id === elementIdentifier);
      }
    );

    result.set(nameSpace, selected);
  }

  return result;
};
