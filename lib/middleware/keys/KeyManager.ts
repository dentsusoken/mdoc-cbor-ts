import { COSEKey } from '@auth0/cose';
import { KeyKinds, KeyPair } from './types';

/**
 * Interface for managing cryptographic key pairs and their conversions
 */
export interface KeyManager {
  /**
   * Loads a private key for subsequent key pair operations
   * @param {KeyKinds} privateKey - Private key to be loaded
   */
  loadPrivateKey(privateKey: KeyKinds): void;

  /**
   * Generates a CryptoKey pair from the loaded private key
   * @returns {Promise<KeyPair<CryptoKey>>} Promise resolving to a CryptoKey pair
   */
  getCryptoKeyPair(): Promise<KeyPair<CryptoKey>>;

  /**
   * Generates a JWK pair from the loaded private key
   * @returns {Promise<KeyPair<JsonWebKey>>} Promise resolving to a JWK pair
   */
  getJWKPair(): Promise<KeyPair<JsonWebKey>>;

  /**
   * Generates a COSE key pair from the loaded private key
   * @returns {Promise<KeyPair<COSEKey>>} Promise resolving to a COSE key pair
   */
  getCoseKeyPair(): Promise<KeyPair<COSEKey>>;
}
