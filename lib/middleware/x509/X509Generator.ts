import { EncodingType } from './types';

/**
 * Interface for generating X.509 certificates
 * Provides functionality to generate certificates in different encodings
 */
export interface X509Generator {
  /**
   * Generates an X.509 certificate
   * @param {EncodingType} encoding - The desired encoding format for the certificate
   * @returns {Promise<string | ArrayBuffer>} The generated certificate in the specified encoding
   */
  generate(encoding: EncodingType): Promise<string | ArrayBuffer>;
}
