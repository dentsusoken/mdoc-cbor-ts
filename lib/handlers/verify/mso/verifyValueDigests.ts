import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import {
  IssuerSignedItem,
  issuerSignedItemSchema,
} from '@/schemas/mdoc/IssuerSignedItem';
import { calculateDigest } from '@/utils/calculateDigest';
import { decodeCbor } from '@/cbor/codec';
import { ValueDigests } from '@/schemas/mso/ValueDigests';
import { Errors } from '@/schemas/mdoc/Errors';
import { ErrorItems } from '@/schemas/mdoc/ErrorItems';
import { ErrorsError } from '@/mdoc/ErrorsError';
import { compareUint8Arrays } from 'u8a-utils';
import { MDocErrorCode } from '@/mdoc/types';
import { NameSpaceError } from '@/mdoc/NameSpaceError';

/**
 * Parameters for verifying value digests for a Mobile Security Object (MSO).
 */
type VerifyValueDigestsParams = {
  /** The expected value digests from the MSO */
  valueDigests: ValueDigests;
  /** The issuer namespaces containing issuer signed item tags */
  nameSpaces: IssuerNameSpaces;
  /** The digest algorithm to use for calculating digests */
  digestAlgorithm: string;
};

/**
 * Verifies the value digests of issuer-signed items within provided namespaces
 * against expected digests in the Mobile Security Object (MSO).
 *
 * For each issuer namespace, checks that the corresponding valueDigests entry exists.
 * Iterates through each issuer-signed tag, checks CBOR validity and type. Calculates the digest
 * for each issuer-signed item and compares against the expected digest in valueDigests. Tracks
 * per-element errors by element identifier within each namespace, and aggregates errors per
 * namespace.
 *
 * Throws specific NameSpaceError for missing digests, CBOR issues, or validation mismatches. At the end,
 * if any per-namespace errors exist, throws a collective ErrorsError.
 *
 * @param {Object} params - Parameters for value digest verification.
 * @param {ValueDigests} params.valueDigests - The expected value digests from the MSO.
 * @param {IssuerNameSpaces} params.nameSpaces - The issuer namespaces with their signed item tags.
 * @param {string} params.digestAlgorithm - The digest algorithm to use for digest calculation.
 *
 * @throws {NameSpaceError} If the value digests are missing for a namespace, or if CBOR validation/decoding fails.
 * @throws {ErrorsError} If one or more digests mismatches or are missing for a digestID within a namespace.
 */
export const verifyValueDigests = ({
  valueDigests,
  nameSpaces,
  digestAlgorithm,
}: VerifyValueDigestsParams): void => {
  const errors: Errors = new Map<string, ErrorItems>();

  for (const [nameSpace, issuerSignedItemTags] of nameSpaces) {
    const errorItems: ErrorItems = new Map<string, number>();
    const digestMap = valueDigests.get(nameSpace);

    if (!digestMap) {
      throw new NameSpaceError(
        nameSpace,
        MDocErrorCode.ValueDigestsMissingForNamespace
      );
    }

    for (const tag of issuerSignedItemTags) {
      try {
        const decoded = decodeCbor(tag.value);
        const result = issuerSignedItemSchema.safeParse(decoded);

        if (!result.success) {
          throw new NameSpaceError(
            nameSpace,
            MDocErrorCode.CborValidationError
          );
        }

        const issuerSignedItem = result.data as IssuerSignedItem;
        const digestID = issuerSignedItem.get('digestID')!;
        const elementIdentifier = issuerSignedItem.get('elementIdentifier')!;
        const calculatedDigest = calculateDigest(digestAlgorithm, tag);
        const expectedDigest = digestMap.get(digestID);

        if (!expectedDigest) {
          errorItems.set(
            elementIdentifier,
            MDocErrorCode.ValueDigestsMissingForDigestId
          );
          continue;
        }

        if (!compareUint8Arrays(expectedDigest, calculatedDigest)) {
          errorItems.set(elementIdentifier, MDocErrorCode.MsoDigestMismatch);
          continue;
        }
      } catch (error) {
        throw new NameSpaceError(nameSpace, MDocErrorCode.CborDecodingError);
      }
    }

    if (errorItems.size > 0) {
      errors.set(nameSpace, errorItems);
    }
  }

  if (errors.size > 0) {
    throw new ErrorsError('Value digests verification failed', errors);
  }
};
