import { ConvertToCoseKey, defaultConvertToCoseKey } from './ConvertToCoseKey';
import {
  ConvertToCryptoKey,
  defaultConvertToCryptoKey,
} from './ConvertToCryptoKey';
import { ConvertToJWK, defaultConvertToJWK } from './ConvertToJWK';
import { KeyConverter } from './KeyConverter';

/**
 * Constructor type for KeyConverterImpl
 * Allows partial initialization of converter functions
 */
export type KeyConverterConstructor = Partial<KeyConverter>;

/**
 * Default implementation of KeyConverter interface
 * Provides key format conversion functionality with configurable converter functions
 * @implements {KeyConverter}
 */
export class KeyConverterImpl implements KeyConverter {
  readonly convertToCryptoKey: ConvertToCryptoKey;
  readonly convertToJWK: ConvertToJWK;
  readonly convertToCoseKey: ConvertToCoseKey;

  /**
   * Creates an instance of KeyConverterImpl
   * @param {KeyConverterConstructor} options - Configuration object for converter functions
   * @param {ConvertToCoseKey} [options.convertToCoseKey] - Custom function to convert to COSEKey
   * @param {ConvertToCryptoKey} [options.convertToCryptoKey] - Custom function to convert to CryptoKey
   * @param {ConvertToJWK} [options.convertToJWK] - Custom function to convert to JWK
   */
  constructor({
    convertToCoseKey,
    convertToCryptoKey,
    convertToJWK,
  }: KeyConverterConstructor) {
    convertToCoseKey
      ? (this.convertToCoseKey = convertToCoseKey)
      : (this.convertToCoseKey = defaultConvertToCoseKey);

    convertToCryptoKey
      ? (this.convertToCryptoKey = convertToCryptoKey)
      : (this.convertToCryptoKey = defaultConvertToCryptoKey);

    convertToJWK
      ? (this.convertToJWK = convertToJWK)
      : (this.convertToJWK = defaultConvertToJWK);
  }
}
