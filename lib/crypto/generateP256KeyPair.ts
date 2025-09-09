import { KEYUTIL } from 'jsrsasign';
import { type ECPrivateJWK, type ECPublicJWK } from './types';

/**
 * Result type for P-256 key pair generation
 * @description
 * Contains the generated private and public keys in JWK format
 */
type GenerateP256KeyPairResult = {
  /** The private key in JWK format */
  privateKeyJwk: ECPrivateJWK;
  /** The public key in JWK format */
  publicKeyJwk: ECPublicJWK;
};

/**
 * Generates a P-256 (secp256r1) elliptic curve key pair
 * @description
 * Uses jsrsasign's KEYUTIL to generate a new P-256 elliptic curve key pair
 * and returns both the private and public keys in JWK format.
 *
 * @returns An object containing the private key and public key in JWK format
 *
 * @example
 * ```typescript
 * const keyPair = generateP256KeyPair();
 * console.log(keyPair.privateKeyJwk); // JWK object with private key
 * console.log(keyPair.publicKeyJwk);  // JWK object with public key
 * ```
 */
export const generateP256KeyPair = (): GenerateP256KeyPairResult => {
  const { prvKeyObj, pubKeyObj } = KEYUTIL.generateKeypair('EC', 'secp256r1');
  const privateKeyJwk = KEYUTIL.getJWK(prvKeyObj) as ECPrivateJWK;
  const publicKeyJwk = KEYUTIL.getJWK(pubKeyObj) as ECPublicJWK;
  return {
    privateKeyJwk,
    publicKeyJwk,
  };
};
