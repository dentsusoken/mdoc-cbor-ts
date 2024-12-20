import * as x509 from '@peculiar/x509';
import { Buffer } from 'node:buffer';
import { X509Parser } from './X509Parser';

/**
 * Implementation of X509Parser interface
 * Parses X.509 certificates using the Peculiar x509 library
 */
export class X509ParserImpl implements X509Parser {
  /**
   * Parses an X.509 certificate from various input formats
   * @param {string | ArrayBuffer | Uint8Array | Buffer} cert - The certificate data to parse
   * @returns {x509.X509Certificate} The parsed X.509 certificate object
   */
  parse(
    cert: string | ArrayBuffer | Uint8Array | Buffer
  ): x509.X509Certificate {
    return new x509.X509Certificate(cert);
  }
}
