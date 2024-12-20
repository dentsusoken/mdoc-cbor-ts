import { EncodingType } from './types';

/**
 * Interface for generating X.509 certificates
 * Provides functionality to generate certificates in different encodings
 */
export interface X509Generator {
  /**
   * Generates a PEM-encoded X.509 certificate
   * @param {EncodingType} encoding - Must be 'pem'
   * @returns {Promise<string>} PEM-encoded certificate
   */
  generate(encoding: 'pem'): Promise<string>;

  /**
   * Generates a DER-encoded X.509 certificate
   * @param {EncodingType} encoding - Must be 'der'
   * @returns {Promise<ArrayBuffer>} DER-encoded certificate
   */
  generate(encoding: 'der'): Promise<ArrayBuffer>;

  /**
   * Generates an X.509 certificate in the specified encoding
   * @param {EncodingType} encoding - The desired encoding format ('pem' or 'der')
   * @returns {Promise<string | ArrayBuffer>} The generated certificate
   */
  generate(encoding: EncodingType): Promise<string | ArrayBuffer>;
}
