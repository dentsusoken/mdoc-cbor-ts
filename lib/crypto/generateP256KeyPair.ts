import { KEYUTIL } from 'jsrsasign';
import { type EcPrivateJwk, type EcPublicJwk } from '@/jwk/types';

/**
 * Result type for P-256 key pair generation
 * @description
 * Contains the generated private and public keys in JWK format
 */
type GenerateP256KeyPairResult = {
  /** The private key in JWK format */
  privateJwk: EcPrivateJwk;
  /** The public key in JWK format */
  publicJwk: EcPublicJwk;
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
 * console.log(keyPair.privateJwk); // JWK object with private key
 * console.log(keyPair.publicJwk);  // JWK object with public key
 * ```
 */
export const generateP256KeyPair = (): GenerateP256KeyPairResult => {
  const { prvKeyObj, pubKeyObj } = KEYUTIL.generateKeypair('EC', 'secp256r1');
  const privateKeyJwk = KEYUTIL.getJWK(prvKeyObj) as EcPrivateJwk;
  const publicKeyJwk = KEYUTIL.getJWK(pubKeyObj) as EcPublicJwk;
  return {
    privateJwk: privateKeyJwk,
    publicJwk: publicKeyJwk,
  };
};
