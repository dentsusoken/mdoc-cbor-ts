import * as x509 from '@peculiar/x509';
import { Buffer } from 'node:buffer';

/**
 * Interface for parsing X.509 certificates
 * Provides functionality to parse certificates from various formats
 */
export interface X509Parser {
  /**
   * Parses an X.509 certificate from various input formats
   * @param {string | ArrayBuffer | Uint8Array | Buffer} cert - The certificate data to parse
   * @returns {x509.X509Certificate} The parsed X.509 certificate object
   */
  parse(cert: string | ArrayBuffer | Uint8Array | Buffer): x509.X509Certificate;
}
