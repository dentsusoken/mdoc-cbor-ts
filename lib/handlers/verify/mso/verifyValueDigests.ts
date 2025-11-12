import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import {
  IssuerSignedItem,
  issuerSignedItemSchema,
} from '@/schemas/mdoc/IssuerSignedItem';
import { calculateDigest } from '@/utils/calculateDigest';
import { decodeCbor } from '@/cbor/codec';
import { ValueDigests } from '@/schemas/mso/ValueDigests';
import { compareUint8Arrays } from 'u8a-utils';
import { MdocErrorCode } from '@/mdoc/types';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { getErrorMessage } from '@/utils/getErrorMessage';

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
 * @description
 * For each issuer namespace, checks that the corresponding valueDigests entry exists.
 * Iterates through each issuer-signed tag, validates CBOR decoding and schema structure.
 * Calculates the digest for each issuer-signed item and compares against the expected
 * digest in valueDigests.
 *
 * @param params - Parameters for value digest verification.
 * @param params.valueDigests The expected value digests from the MSO.
 * @param params.nameSpaces The issuer namespaces with their signed item tags.
 * @param params.digestAlgorithm The digest algorithm to use for digest calculation.
 *
 * @throws {ErrorCodeError} With {@link MdocErrorCode.ValueDigestsMissing} if value digests are missing for a namespace.
 * @throws {ErrorCodeError} With {@link MdocErrorCode.IssuerSignedItemCborDecodingError} if CBOR decoding fails for an issuer-signed item.
 * @throws {ErrorCodeError} With {@link MdocErrorCode.IssuerSignedItemCborValidationError} if schema validation fails for an issuer-signed item.
 * @throws {ErrorCodeError} With {@link MdocErrorCode.ValueDigestMissing} if a digest is missing for a digestID within a namespace.
 * @throws {ErrorCodeError} With {@link MdocErrorCode.ValueDigestMismatch} if a calculated digest does not match the expected digest.
 *
 * @see {@link ErrorCodeError}
 * @see {@link MdocErrorCode}
 */
export const verifyValueDigests = ({
  valueDigests,
  nameSpaces,
  digestAlgorithm,
}: VerifyValueDigestsParams): void => {
  for (const [nameSpace, issuerSignedItemTags] of nameSpaces) {
    const digestMap = valueDigests.get(nameSpace);

    if (!digestMap) {
      throw new ErrorCodeError(
        `Value digests missing for namespace: ${nameSpace}`,
        MdocErrorCode.ValueDigestsMissing
      );
    }

    issuerSignedItemTags.forEach((tag, index) => {
      let decoded;
      try {
        decoded = decodeCbor(tag.value);
      } catch (error) {
        throw new ErrorCodeError(
          `Failed to cbor-decode issuer-signed item[${index}]: ${getErrorMessage(error)}`,
          MdocErrorCode.IssuerSignedItemCborDecodingError
        );
      }

      const result = issuerSignedItemSchema.safeParse(decoded);

      if (!result.success) {
        throw new ErrorCodeError(
          `Failed to validate issuer-signed item[${index}] structure: ${result.error.message}`,
          MdocErrorCode.IssuerSignedItemCborValidationError
        );
      }

      const issuerSignedItem = result.data as IssuerSignedItem;
      const digestID = issuerSignedItem.get('digestID')!;
      const elementIdentifier = issuerSignedItem.get('elementIdentifier')!;
      const calculatedDigest = calculateDigest(digestAlgorithm, tag);
      const expectedDigest = digestMap.get(digestID);

      if (!expectedDigest) {
        throw new ErrorCodeError(
          `Value digest missing for elementIdentifier: ${elementIdentifier}`,
          MdocErrorCode.ValueDigestMissing
        );
      }

      if (!compareUint8Arrays(expectedDigest, calculatedDigest)) {
        throw new ErrorCodeError(
          `Value digest mismatch for elementIdentifier: ${elementIdentifier}`,
          MdocErrorCode.ValueDigestMismatch
        );
      }
    });
  }
};
