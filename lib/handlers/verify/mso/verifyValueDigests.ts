import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { issuerSignedItemSchema } from '@/schemas/mdoc/IssuerSignedItem';
import { DigestAlgorithm } from '@/schemas/mso/DigestAlgorithm';
import { calculateDigest } from '@/utils/calculateDigest';
import { decodeCbor } from '@/cbor/codec';
import { ValueDigests } from '@/schemas/mso/ValueDigests';
import { Errors } from '@/schemas/mdoc/Errors';
import { ErrorItems } from '@/schemas/mdoc/ErrorItems';
import { NameSpace } from '@/schemas/common/NameSpace';
import { ErrorCode } from '@/schemas/error/ErrorCode';
import { ErrorsError } from './ErrorsError';
import { compareUint8Arrays } from 'u8a-utils';

/**
 * Parameters for verifying value digests for a Mobile Security Object (MSO).
 */
type VerifyValueDigestsParams = {
  /** The expected value digests from the MSO */
  valueDigests: ValueDigests;
  /** The issuer namespaces containing issuer signed item tags */
  nameSpaces: IssuerNameSpaces;
  /** The digest algorithm to use for calculating digests */
  digestAlgorithm: DigestAlgorithm;
};

/**
 * Verifies value digests for a Mobile Security Object (MSO).
 *
 * This function validates that the calculated digests of issuer signed items match
 * the expected digests stored in the MSO's value digests. It processes each namespace
 * and verifies that:
 * 1. The namespace exists in the value digests
 * 2. Each digest ID from issuer signed items has a corresponding digest in the MSO
 * 3. The calculated digest matches the expected digest from the MSO
 *
 * @param params - The parameters for verifying value digests
 * @param params.valueDigests - The expected value digests from the MSO
 * @param params.nameSpaces - The issuer namespaces containing issuer signed item tags
 * @param params.digestAlgorithm - The digest algorithm to use for calculating digests
 * @throws {ErrorsError} When verification fails, containing detailed error information
 *
 * @example
 * ```typescript
 * await verifyValueDigests({
 *   valueDigests: new Map([
 *     ['org.iso.18013.5.1', new Map([[1, expectedDigest1], [2, expectedDigest2]])],
 *   ]),
 *   nameSpaces: new Map([
 *     ['org.iso.18013.5.1', [tag1, tag2]],
 *   ]),
 *   digestAlgorithm: 'SHA-256'
 * });
 * ```
 */
export const verifyValueDigests = async ({
  valueDigests,
  nameSpaces,
  digestAlgorithm,
}: VerifyValueDigestsParams): Promise<void> => {
  let hasErrors = false;
  const errors: Errors = new Map<NameSpace, ErrorItems>();

  for (const [nameSpace, issuerSignedItemTags] of nameSpaces) {
    const digestMap = valueDigests.get(nameSpace);

    if (!digestMap) {
      hasErrors = true;
      errors.set(
        nameSpace,
        new Map<string, ErrorCode>([
          [':namespace', ErrorCode.value_digests_missing_for_namespace],
        ])
      );
      continue;
    }

    // Keep digestID/digest for upcoming element-level verification
    for (const tag of issuerSignedItemTags) {
      const issuerSignedItem = issuerSignedItemSchema.parse(
        decodeCbor(tag.value)
      );
      const digestID = issuerSignedItem.digestID;
      const elementIdentifier = issuerSignedItem.elementIdentifier;
      const calculatedDigest = await calculateDigest(digestAlgorithm, tag);
      const expectedDigest = digestMap.get(digestID);

      if (!expectedDigest) {
        hasErrors = true;
        errors.set(
          nameSpace,
          new Map<string, ErrorCode>([
            [elementIdentifier, ErrorCode.value_digests_missing_for_digest_id],
          ])
        );
        continue;
      }

      if (!compareUint8Arrays(expectedDigest, calculatedDigest)) {
        hasErrors = true;
        errors.set(
          nameSpace,
          new Map<string, ErrorCode>([
            [elementIdentifier, ErrorCode.mso_digest_mismatch],
          ])
        );
        continue;
      }
    }
  }

  if (hasErrors) {
    throw new ErrorsError('Value digests verification failed', errors);
  }
};
