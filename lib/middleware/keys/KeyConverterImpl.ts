import { CryptoConfig } from '../../conf';
import {
  ConvertToCoseKey,
  createDefaultConvertToCoseKey,
} from './ConvertToCoseKey';
import {
  ConvertToCryptoKey,
  createDefaultConvertToCryptoKey,
} from './ConvertToCryptoKey';
import { ConvertToJWK, createDefaultConvertToJWK } from './ConvertToJWK';
import { KeyConverter } from './KeyConverter';

export type KeyConverterConfig = Omit<CryptoConfig, 'SALT_LENGTH'>;

/**
 * Constructor type for KeyConverterImpl
 * Allows partial initialization of converter functions
 */
export type KeyConverterConstructorOpt = Partial<KeyConverter>;

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
   * @param {KeyConverterConstructorOpt} options - Configuration object for converter functions
   * @param {ConvertToCoseKey} [options.convertToCoseKey] - Custom function to convert to COSEKey
   * @param {ConvertToCryptoKey} [options.convertToCryptoKey] - Custom function to convert to CryptoKey
   * @param {ConvertToJWK} [options.convertToJWK] - Custom function to convert to JWK
   */
  constructor(
    config: KeyConverterConfig,
    {
      convertToCoseKey,
      convertToCryptoKey,
      convertToJWK,
    }: KeyConverterConstructorOpt = {}
  ) {
    const defaultConvertToJWK = createDefaultConvertToJWK(config);
    const defaultConvertToCoseKey =
      createDefaultConvertToCoseKey(defaultConvertToJWK);
    const defaultConvertToCryptoKey =
      createDefaultConvertToCryptoKey(defaultConvertToJWK);

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
