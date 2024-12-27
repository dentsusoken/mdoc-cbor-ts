import { Sign1 } from '@auth0/cose';
import { RawNameSpaces, msoPayloadSchema } from '../../schemas';
import { decode, encode } from 'cbor-x';

export type VerifyDigestHandler = (
  mso: Sign1,
  nameSpaces: RawNameSpaces
) => Promise<void>;

const equals = (a: ArrayBuffer, b: ArrayBuffer): boolean => {
  if (a.byteLength !== b.byteLength) return false;
  const a8 = new Uint8Array(a);
  const b8 = new Uint8Array(b);
  return a8.every((val, i) => val === b8[i]);
};

export const defaultVerifyDigestHandler: VerifyDigestHandler = async (
  mso: Sign1,
  nameSpaces: RawNameSpaces
) => {
  const payload = msoPayloadSchema.parse(decode(mso.payload));

  // Process all namespaces and their disclosures
  await Promise.all(
    Object.entries(nameSpaces).map(async ([nameSpaceId, disclosureMap]) => {
      // Process all disclosures in the current namespace
      await Promise.all(
        disclosureMap.map(async (item) => {
          const digestId = item.value.digestID.toString();
          const expectedDigest = payload.valueDigests[nameSpaceId][digestId];
          if (!expectedDigest) {
            throw new Error(`Digest for ${digestId} not found`);
          }

          const actualDigest = await crypto.subtle.digest(
            payload.digestAlgorithm,
            encode(item.encode())
          );

          if (!equals(actualDigest, expectedDigest)) {
            throw new Error(`Digest mismatch for ${digestId}`);
          }
        })
      );
    })
  );
};
