import { decode } from '../../../cbor';
import { IssuerNameSpaces } from '../../../schemas/mdoc';
import {
  IssuerAuth,
  mobileSecurityObjectBytesSchema,
  mobileSecurityObjectSchema,
} from '../../../schemas/mso';
import { calculateDigest } from '../../../utils/calculateDigest';

/**
 * Type definition for verifying digests in an MSO
 * @description
 * A function type that verifies the digest values of name spaces in an MSO.
 * The function compares calculated digests with the expected values stored
 * in the MSO.
 */
export type VerifyDigest = (
  issuerAuth: IssuerAuth,
  issuerNameSpaces: IssuerNameSpaces
) => Promise<void>;

/**
 * Verifies digest values in an MSO
 * @description
 * Calculates and verifies the digest values for each name space in the MSO.
 * The function decodes the MSO payload, extracts the digest algorithm and
 * expected values, then compares them with calculated digests.
 *
 * @param issuerAuth - The issuer's authentication data containing the MSO
 * @param issuerNameSpaces - The issuer's name spaces to verify
 * @throws {Error} If any digest value does not match the expected value
 *
 * @example
 * ```typescript
 * await verifyDigest(issuerAuth, issuerNameSpaces);
 * ```
 */
export const verifyDigest: VerifyDigest = async (
  issuerAuth,
  issuerNameSpaces
) => {
  const payload = issuerAuth[2];
  const msoByte = mobileSecurityObjectBytesSchema.parse(decode(payload));
  const mso = mobileSecurityObjectSchema.parse(msoByte.data.esMap);
  const { digestAlgorithm, valueDigests } = mso;
  for (const [namespace, issuerSignedItems] of Object.entries(
    issuerNameSpaces
  )) {
    for (const issuerSignedItem of issuerSignedItems) {
      const digestID = issuerSignedItem.data.get('digestID')!;
      const actual = await calculateDigest(digestAlgorithm, issuerSignedItem);
      const expected = valueDigests[namespace][digestID];
      if (!actual.equals(expected)) {
        throw new Error(
          `Digest mismatch for ${namespace}, DigestID: ${digestID}`
        );
      }
    }
  }
};
