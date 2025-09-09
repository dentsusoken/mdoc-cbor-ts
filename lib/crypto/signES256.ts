import { KEYUTIL, KJUR } from 'jsrsasign';
import { ECPrivateJWK } from './types';
import { decodeHex, encodeHex } from 'u8a-utils';

/**
 * Parameters for ES256 signing operation.
 */
type SignES256Params = {
  /** The EC private key in JWK format */
  privateKeyJwk: ECPrivateJWK;
  /** The data to be signed */
  data: Uint8Array;
};

/**
 * Signs data using ES256 (ECDSA with P-256 curve and SHA-256 hash) algorithm.
 *
 * @param params - The signing parameters
 * @param params.privateKeyJwk - The EC private key in JWK format
 * @param params.data - The data to be signed as a Uint8Array
 * @returns The signature as a Uint8Array
 */
export const signES256 = ({
  privateKeyJwk,
  data,
}: SignES256Params): Uint8Array => {
  const privateKey = KEYUTIL.getKey(
    privateKeyJwk as unknown as KJUR.jws.JWS.JsonWebKey
  );
  const sig = new KJUR.crypto.Signature({
    alg: 'SHA256withECDSA',
  });
  sig.init(privateKey);
  sig.updateHex(encodeHex(data));
  const asn1Sig = sig.sign();
  const concatSig = KJUR.crypto.ECDSA.asn1SigToConcatSig(asn1Sig);

  return decodeHex(concatSig);
};
