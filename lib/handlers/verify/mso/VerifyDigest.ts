import { decode } from '../../../cbor';
import { IssuerNameSpaces } from '../../../schemas/mdoc';
import {
  IssuerAuth,
  mobileSecurityObjectBytesSchema,
} from '../../../schemas/mso';
import { calculateDigest } from '../../../utils/calculateDigest';

export type VerifyDigest = (
  issuerAuth: IssuerAuth,
  issuerNameSpaces: IssuerNameSpaces
) => Promise<void>;

export const verifyDigest: VerifyDigest = async (
  issuerAuth,
  issuerNameSpaces
) => {
  const { payload } = issuerAuth;
  const mso = mobileSecurityObjectBytesSchema.parse(decode(payload));
  const { digestAlgorithm, valueDigests } = mso.data;
  for (const [namespace, issuerSignedItems] of Object.entries(
    issuerNameSpaces
  )) {
    for (const issuerSignedItem of issuerSignedItems) {
      const { digestID } = issuerSignedItem.data;
      const actual = await calculateDigest(digestAlgorithm, issuerSignedItem);
      const expected = valueDigests[namespace][digestID];
      if (!actual.equals(expected)) {
        throw new Error(`Digest mismatch for ${namespace} ${digestID}`);
      }
    }
  }
};
