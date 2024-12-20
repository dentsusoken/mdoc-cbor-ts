import { X509Configuration } from '../../conf';
import { KeyManager } from '../keys';
import { EncodingType } from './types';
import { X509Generator } from './X509Generator';
import * as x509 from '@peculiar/x509';
import { Buffer } from 'node:buffer';

/**
 * Implementation of X509Generator interface
 * Generates X.509 certificates using the Peculiar x509 library
 */
export class X509GeneratorImpl implements X509Generator {
  #keyManager: KeyManager;
  #config: X509Configuration;

  /**
   * Creates a new X509GeneratorImpl instance
   * @param {KeyManager} keyManager - Key manager for handling cryptographic keys
   * @param {X509Configuration} config - Configuration for X.509 certificate generation
   */
  constructor(keyManager: KeyManager, config: X509Configuration) {
    this.#keyManager = keyManager;
    this.#config = config;
  }

  /**
   * Generates a PEM-encoded X.509 certificate
   * @param {EncodingType} encoding - Must be 'pem'
   * @returns {Promise<string>} PEM-encoded certificate
   */
  async generate(encoding: 'pem'): Promise<string>;

  /**
   * Generates a DER-encoded X.509 certificate
   * @param {EncodingType} encoding - Must be 'der'
   * @returns {Promise<ArrayBuffer>} DER-encoded certificate
   */
  async generate(encoding: 'der'): Promise<ArrayBuffer>;

  /**
   * Generates an X.509 certificate in the specified encoding
   * @param {EncodingType} encoding - The desired encoding format ('pem' or 'der')
   * @returns {Promise<string | ArrayBuffer>} The generated certificate
   */
  async generate(encoding: EncodingType): Promise<string | ArrayBuffer> {
    const { privateKey, publicKey } = await this.#keyManager.getCryptoKeyPair();

    // TODO: get values from privateKey
    const alg = {
      name: privateKey.algorithm.name,
      namedCurve: 'P-256',
      hash: 'SHA-256',
    };

    const cert = await x509.X509CertificateGenerator.createSelfSigned({
      serialNumber: Buffer.from(
        crypto.getRandomValues(new Uint8Array(32))
      ).toString('hex'),
      name: `C=${this.#config.X509_COUNTRY_NAME}, ST=${
        this.#config.X509_STATE_OR_PROVINCE_NAME
      }, L=${this.#config.X509_LOCALITY_NAME}, O=${
        this.#config.X509_ORGANIZATION_NAME
      }, CN=${this.#config.X509_COMMON_NAME}`,
      notBefore: this.#config.X509_NOT_VALID_BEFORE,
      notAfter: this.#config.X509_NOT_VALID_AFTER,
      signingAlgorithm: alg,
      keys: {
        publicKey,
        privateKey,
      },
      extensions: [
        new x509.SubjectAlternativeNameExtension([
          new x509.GeneralName('url', this.#config.X509_SAN_URL),
        ]),
      ],
    });

    if (encoding === 'der') {
      return cert.rawData;
    } else {
      return cert.toString('pem');
    }
  }
}
