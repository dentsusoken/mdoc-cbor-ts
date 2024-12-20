import { COSEKey } from '@auth0/cose';
import { JWK } from 'jose';

/**
 * Union type for different key formats
 * Represents either a CryptoKey, JWK, or COSEKey
 */
export type KeyKinds = CryptoKey | JWK | COSEKey;

/**
 * Type for key usage
 * Represents either a private or public key
 */
export type KeyType = 'private' | 'public';

export interface KeyPair<T> {
  privateKey: T;
  publicKey: T;
}
