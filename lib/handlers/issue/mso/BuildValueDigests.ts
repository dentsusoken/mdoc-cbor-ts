import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { issuerSignedItemSchema } from '@/schemas/mdoc/IssuerSignedItem';

import { calculateDigest } from '@/utils/calculateDigest';
import { decodeCbor } from '@/cbor/codec';
import { ValueDigests } from '@/schemas/mso/ValueDigests';

/**
 * Parameters for building value digests for a Mobile Security Object (MSO).
 */
type BuildValueDigestsParams = {
  /** The issuer namespaces containing issuer signed item tags */
  nameSpaces: IssuerNameSpaces;
  /** The digest algorithm to use for calculating digests */
  digestAlgorithm: DigestAlgorithm;
};

/**
 * Builds value digests for a Mobile Security Object (MSO).
 *
 * This function processes issuer namespaces and their associated issuer signed item tags,
 * calculating digests for each tag using the specified digest algorithm. The function
 * extracts the digestID from each issuer signed item and creates a mapping of digestID
 * to the calculated digest value.
 *
 * @param params - The parameters for building value digests
 * @param params.nameSpaces - The issuer namespaces containing issuer signed item tags
 * @param params.digestAlgorithm - The digest algorithm to use for calculating digests
 * @returns A Promise that resolves to a ValueDigests object mapping namespace to digestID to digest value
 *
 * @example
 * ```typescript
 * const valueDigests = await buildValueDigests({
 *   nameSpaces: new Map([
 *     ['org.iso.18013.5.1', [tag1, tag2]],
 *     ['org.iso.18013.5.2', [tag3]]
 *   ]),
 *   digestAlgorithm: 'SHA-256'
 * });
 *
 * // Result structure:
 * // Map {
 * //   'org.iso.18013.5.1' => Map { 1 => Uint8Array, 2 => Uint8Array },
 * //   'org.iso.18013.5.2' => Map { 3 => Uint8Array }
 * // }
 * ```
 */
export const buildValueDigests = async ({
  nameSpaces,
  digestAlgorithm,
}: BuildValueDigestsParams): Promise<ValueDigests> => {
  const valueDigests: ValueDigests = new Map<string, Map<number, Uint8Array>>();

  for (const [nameSpace, issuerSignedItemTags] of nameSpaces) {
    const digestMap = new Map<number, Uint8Array>();

    for (const tag of issuerSignedItemTags) {
      const issuerSignedItem = issuerSignedItemSchema.parse(
        decodeCbor(tag.value)
      );

      const digestID = issuerSignedItem.digestID;
      const digest = await calculateDigest(digestAlgorithm, tag);
      digestMap.set(digestID, digest);
    }

    valueDigests.set(nameSpace, digestMap);
  }

  return valueDigests;
};
