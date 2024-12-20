import { ConvertToCoseKey } from './ConvertToCoseKey';
import { ConvertToCryptoKey } from './ConvertToCryptoKey';
import { ConvertToJWK } from './ConvertToJWK';

/**
 * Interface for converting between different key formats
 * @property {ConvertToCryptoKey} convertToCryptoKey - Function to convert JWK or COSEKey to CryptoKey
 * @property {ConvertToJWK} convertToJWK - Function to convert CryptoKey or COSEKey to JWK
 * @property {ConvertToCoseKey} convertToCoseKey - Function to convert CryptoKey or JWK to COSEKey
 */
export interface KeyConverter {
  convertToCryptoKey: ConvertToCryptoKey;
  convertToJWK: ConvertToJWK;
  convertToCoseKey: ConvertToCoseKey;
}
