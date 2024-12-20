import { COSEKey } from '@auth0/cose';
import { KeyConverter } from './KeyConverter';
import { KeyConverterConstructor, KeyConverterImpl } from './KeyConverterImpl';
import { KeyManager } from './KeyManager';
import { KeyKinds, KeyPair } from './types';

/**
 * Type alias for KeyConverter constructor options
 */
export type KeyConverterConstructorOpt = KeyConverterConstructor;

/**
 * Implementation of KeyManager interface
 * Manages cryptographic key pairs and their conversions using KeyConverter
 * @implements {KeyManager}
 */
export class KeyManagerImpl implements KeyManager {
  #privateKey: KeyKinds;
  #keyConverter: KeyConverter;

  /**
   * Creates an instance of KeyManagerImpl
   * @param {KeyKinds} privateKey - Initial private key
   * @param {KeyConverterConstructorOpt} options - Options for KeyConverter initialization
   */
  constructor(privateKey: KeyKinds, options: KeyConverterConstructorOpt) {
    this.#privateKey = privateKey;
    this.#keyConverter = new KeyConverterImpl(options);
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
        'private'
      ),
      publicKey: await this.#keyConverter.convertToCoseKey(
        this.#privateKey,
        'public'
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
        'private'
      ),
      publicKey: await this.#keyConverter.convertToCryptoKey(
        this.#privateKey,
        'public'
      ),
    };
  }

  /**
   * @inheritdoc
   */
  async getJWKPair(): Promise<KeyPair<JsonWebKey>> {
    return {
      privateKey: await this.#keyConverter.convertToJWK(
        this.#privateKey,
        'private'
      ),
      publicKey: await this.#keyConverter.convertToJWK(
        this.#privateKey,
        'public'
      ),
    };
  }
}
