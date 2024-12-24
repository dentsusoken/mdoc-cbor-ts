export interface CryptoConfig {
  NAMED_CURVE: 'P-256' | 'P-384' | 'P-521';
  KEY_ALGORITHM: 'ES256' | 'ES384' | 'ES512';
  HASH_ALGORITHM: 'SHA-256' | 'SHA-384' | 'SHA-512';
  SALT_LENGTH: number;
}
