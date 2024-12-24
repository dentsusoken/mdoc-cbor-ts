import { COSEKey } from '@auth0/cose';
import { KeyConverter } from './KeyConverter';
import { KeyConverterImpl } from './KeyConverterImpl';
import { KeyManager } from './KeyManager';
import { KeyKinds, KeyPair } from './types';
import { JWK } from '../../schemas/keys';
import { Buffer } from 'node:buffer';

/**
 * Implementation of KeyManager interface
 * Manages cryptographic key pairs and their conversions using KeyConverter
 * @implements {KeyManager}
 */
export class KeyManagerImpl implements KeyManager {
  #privateKey: KeyKinds;
  #keyConverter: KeyConverter;
  #kid: string;

  /**
   * Creates an instance of KeyManagerImpl
   * @param {KeyKinds} privateKey - Initial private key
   * @param {KeyConverter} keyConverter - KeyConverter instance
   */
  constructor(privateKey: KeyKinds, keyConverter: KeyConverterImpl) {
    const generateKid = () => {
      return Buffer.from(crypto.randomUUID()).toString('hex');
    };
    this.#privateKey = privateKey;
    this.#keyConverter = keyConverter;
    if (privateKey instanceof CryptoKey) {
      this.#kid = generateKid();
    } else if (privateKey instanceof COSEKey) {
      const jwk = privateKey.toJWK();
      this.#kid = jwk.kid ?? generateKid();
    } else {
      this.#kid = privateKey.kid ?? generateKid();
    }
  }

  /**
   * @inheritdoc
   */
  loadPrivateKey(privateKey: KeyKinds): void {
    this.#privateKey = privateKey;
  }

  /**
   * @inheritdoc
   */
  async getCoseKeyPair(): Promise<KeyPair<COSEKey>> {
    return {
      privateKey: await this.#keyConverter.convertToCoseKey(
        this.#privateKey,
        'private',
        this.#kid
      ),
      publicKey: await this.#keyConverter.convertToCoseKey(
        this.#privateKey,
        'public',
        this.#kid
      ),
    };
  }

  /**
   * @inheritdoc
   */
  async getCryptoKeyPair(): Promise<KeyPair<CryptoKey>> {
    return {
      privateKey: await this.#keyConverter.convertToCryptoKey(
        this.#privateKey,
        'private',
        this.#kid
      ),
      publicKey: await this.#keyConverter.convertToCryptoKey(
        this.#privateKey,
        'public',
        this.#kid
      ),
    };
  }

  /**
   * @inheritdoc
   */
  async getJWKPair(): Promise<KeyPair<JWK>> {
    return {
      privateKey: await this.#keyConverter.convertToJWK(
        this.#privateKey,
        'private',
        this.#kid
      ),
      publicKey: await this.#keyConverter.convertToJWK(
        this.#privateKey,
        'public',
        this.#kid
      ),
    };
  }
}
