import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { ValueDigests } from '@/schemas/mso/ValueDigests';
import { buildValueDigest } from './buildValueDigest';

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
 * @description
 * Iterates over issuer namespaces and their associated issuer signed item tags,
 * calculates a digest for each tag using the specified digest algorithm, and
 * maps each digestID to its corresponding digest value. The result is a nested
 * map structure: namespace string → digestID (number) → digest (Uint8Array).
 *
 * @param params - The parameters for building value digests.
 * @param params.nameSpaces - The issuer namespaces containing issuer signed item tags.
 * @param params.digestAlgorithm - The digest algorithm to use for calculating digests.
 * @returns A ValueDigests object mapping each namespace to a map of digestID to digest value.
 *
 * @example
 * const valueDigests = buildValueDigests({
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
 */
export const buildValueDigests = ({
  nameSpaces,
  digestAlgorithm,
}: BuildValueDigestsParams): ValueDigests => {
  const valueDigests: ValueDigests = new Map<string, Map<number, Uint8Array>>();

  for (const [nameSpace, issuerSignedItemTags] of nameSpaces) {
    const digestMap = new Map<number, Uint8Array>();

    for (const tag of issuerSignedItemTags) {
      const { digestID, digest } = buildValueDigest({
        issuerSignedItemTag: tag,
        digestAlgorithm,
      });
      digestMap.set(digestID, digest);
    }

    valueDigests.set(nameSpace, digestMap);
  }

  return valueDigests;
};
