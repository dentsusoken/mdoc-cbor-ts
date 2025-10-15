import { Tag } from 'cbor-x';
import { decodeCbor } from '@/cbor';
import { issuerSignedItemSchema } from '@/schemas/mdoc/IssuerSignedItem';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { DigestID } from '@/schemas/mso/DigestID';
import { calculateDigest } from '@/utils/calculateDigest';

/**
 * Parameters for building a value digest from an issuer signed item
 */
type BuildValueDigestParams = {
  /** CBOR Tag 24 wrapped issuer signed item */
  issuerSignedItemTag: Tag;
  /** Digest algorithm to use for calculating the digest */
  digestAlgorithm: DigestAlgorithm;
};

/**
 * Result of building a value digest
 * @description
 * Contains the digest ID and its corresponding digest value for a single
 * issuer signed item. This is used in the ValueDigests structure of the MSO.
 */
export type BuildValueDigestResult = {
  /** The calculated digest of the issuer signed item tag */
  digest: Uint8Array;
  /** The digest ID from the issuer signed item */
  digestID: DigestID;
};

/**
 * Builds a value digest from an issuer signed item tag
 * @description
 * Extracts the digest ID from the issuer signed item and calculates its digest
 * using the specified algorithm. This combines two operations that are typically
 * needed together when processing issuer signed items for MSO creation or verification.
 *
 * The function:
 * 1. Decodes the CBOR Tag 24 to extract the issuer signed item
 * 2. Retrieves the digest ID from the item
 * 3. Calculates the digest of the entire tag using the specified algorithm
 *
 * @param params - Parameters containing the tag and digest algorithm
 * @returns An object with the digest ID and calculated digest
 *
 * @example
 * ```typescript
 * const result = buildValueDigest({
 *   issuerSignedItemTag: tag24,
 *   digestAlgorithm: 'SHA-256'
 * });
 * // Returns: { digestID: 0, digest: Uint8Array(...) }
 * ```
 *
 * @see {@link BuildValueDigestParams}
 * @see {@link BuildValueDigestResult}
 */
export const buildValueDigest = ({
  issuerSignedItemTag,
  digestAlgorithm,
}: BuildValueDigestParams): BuildValueDigestResult => {
  const issuerSignedItem = issuerSignedItemSchema.parse(
    decodeCbor(issuerSignedItemTag.value)
  );
  const digest = calculateDigest(digestAlgorithm, issuerSignedItemTag);

  return {
    digest,
    digestID: issuerSignedItem.get('digestID')!,
  };
};
