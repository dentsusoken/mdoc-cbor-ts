import { decodeCbor } from '@/cbor/codec';
import { Tag } from 'cbor-x';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';

/**
 * Extracts a filtered subset of IssuerNameSpaces based on requested element identifiers.
 *
 * @description
 * Given the input IssuerNameSpaces (a map of namespace -> Tag[] of IssuerSignedItems),
 * and a selection Record mapping each namespace to an array of requested element identifiers,
 * this function returns a new IssuerNameSpaces containing only the IssuerSignedItem Tag(24)s
 * whose "elementIdentifier" matches one of the strings in the requested array for that namespace.
 *
 * This is useful for selectively returning only a requested subset of issuer-signed elements across
 * one or more namespaces (e.g., for selective disclosure scenarios).
 *
 * @param nameSpaces - All available issuer-signed namespaces; Map from namespace string to array of Tag(24) IssuerSignedItems.
 * @param nameSpaceElementIdentities - Record mapping each namespace string to an array of allowed elementIdentifiers to include.
 * @returns A new IssuerNameSpaces Map including only selected namespaces (if present in the selector) and only the requested elements within those namespaces.
 *
 * @example
 * ```typescript
 * const issuerNameSpaces: IssuerNameSpaces = new Map([
 *   ['org.iso.18013.5.1', [/* Tag(24) with elementIdentifier 'given_name', ... * /]],
 *   ['org.iso.18013.5.2', [/* Tag(24) with elementIdentifier 'document_number', ... * /]],
 * ]);
 * const selected = extractSelectedIssuerNameSpaces(issuerNameSpaces, {
 *   'org.iso.18013.5.1': ['given_name'],
 * });
 * ```
 */
export const extractSelectedIssuerNameSpaces = (
  nameSpaces: IssuerNameSpaces,
  nameSpaceElementIdentities: Record<string, string[]>
): IssuerNameSpaces => {
  const result = new Map<string, Tag[]>();

  for (const [nameSpace, issuerSignedItemTags] of nameSpaces.entries()) {
    const requestedIdentities = nameSpaceElementIdentities[nameSpace];

    if (!requestedIdentities) {
      continue;
    }

    const selected = issuerSignedItemTags.filter((tag) => {
      const issuerSignedItem = decodeCbor(tag.value) as IssuerSignedItem;
      const elementIdentifier = issuerSignedItem.get('elementIdentifier')!;

      return requestedIdentities.some((id) => id === elementIdentifier);
    });

    result.set(nameSpace, selected);
  }

  return result;
};
