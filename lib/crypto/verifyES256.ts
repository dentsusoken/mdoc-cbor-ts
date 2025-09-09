import { KEYUTIL, KJUR } from 'jsrsasign';
import { ECPublicJWK } from './types';
import { encodeHex } from 'u8a-utils';

/**
 * Parameters for ES256 signature verification operation.
 */
type VerifyES256Params = {
  /** The EC public key in JWK format */
  publicKeyJwk: ECPublicJWK;
  /** The data that was signed */
  data: Uint8Array;
  /** The signature to verify */
  signature: Uint8Array;
};

/**
 * Verifies a signature using ES256 (ECDSA with P-256 curve and SHA-256 hash) algorithm.
 *
 * @param params - The verification parameters
 * @param params.publicKeyJwk - The EC public key in JWK format
 * @param params.data - The data that was signed as a Uint8Array
 * @param params.signature - The signature to verify as a Uint8Array
 * @returns True if the signature is valid, false otherwise
 */
export const verifyES256 = ({
  publicKeyJwk,
  data,
  signature,
}: VerifyES256Params): boolean => {
  const publicKey = KEYUTIL.getKey(
    publicKeyJwk as unknown as KJUR.jws.JWS.JsonWebKey
  );
  const sig = new KJUR.crypto.Signature({
    alg: 'SHA256withECDSA',
  });
  sig.init(publicKey);
  sig.updateHex(encodeHex(data));

  const asn1Sig = KJUR.crypto.ECDSA.concatSigToASN1Sig(encodeHex(signature));

  return sig.verify(asn1Sig);
};
