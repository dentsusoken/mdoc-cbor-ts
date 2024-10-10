import { COSEKey, COSEKeyParam } from '@auth0/cose';
import * as x509 from '@peculiar/x509';
import { Buffer } from 'node:buffer';
import { Settings } from './settings';

/**
 * MsoX509Fabric is a class that provides methods to generate X509 certificates.
 * @property privateKey - The private key used to sign the certificate.
 * @property settings - The settings used to generate the certificate.
 *
 * @example
 * const privateKey = COSEKey.from({ kty: 'EC', crv: 'P-256', d: Buffer.from('...') });
 * const settings = new Settings();
 * const fabric = new MsoX509Fabric(privateKey, settings);
 * const cert = await fabric.selfsignedX509Cert('DER');
 * console.log(cert);
 */
export class MsoX509Fabric {
  #privateKey: COSEKey;
  #settings: Settings;

  /**
   * Create a new MsoX509Fabric instance.
   * @param privateKey - The private key used to sign the certificate.
   * @param settings - The settings used to generate the certificate.
   */
  constructor(privateKey: COSEKey, settings: Settings) {
    privateKey.set(
      COSEKeyParam.KeyID,
      crypto.getRandomValues(new Uint8Array(32))
    );
    this.#privateKey = privateKey;
    this.#settings = settings;
  }

  get privateKey() {
    return this.#privateKey;
  }

  get settings() {
    return this.#settings;
  }

  /**
   * Generate a self-signed X509 certificate.
   * @param encoding - The encoding of the certificate. Default is 'DER'.
   * @returns The self-signed X509 certificate.
   */
  async selfsignedX509Cert(encoding: 'DER'): Promise<ArrayBuffer>;
  async selfsignedX509Cert(encoding: 'PEM'): Promise<string>;
  async selfsignedX509Cert(encoding: 'DER' | 'PEM' = 'DER') {
    const privateCryptoKey = await this.privateCryptoKey;
    const publicCryptoKey = await this.publicCryptoKey;

    const keys = {
      privateKey: privateCryptoKey,
      publicKey: publicCryptoKey,
    };

    // TODO - change to use settings
    const alg = {
      name: 'ECDSA',
      namedCurve: 'P-256',
      hash: 'SHA-256',
    };

    const cert = await x509.X509CertificateGenerator.createSelfSigned({
      serialNumber: Buffer.from(
        crypto.getRandomValues(new Uint8Array(32))
      ).toString('hex'),
      name: `C=${this.#settings.X509_COUNTRY_NAME()}, ST=${this.#settings.X509_STATE_OR_PROVINCE_NAME()}, L=${this.#settings.X509_LOCALITY_NAME()}, O=${this.#settings.X509_ORGANIZATION_NAME()}, CN=${this.#settings.X509_COMMON_NAME()}`,
      notBefore: this.#settings.X509_NOT_VALID_BEFORE(),
      notAfter: this.#settings.X509_NOT_VALID_AFTER(),
      signingAlgorithm: alg,
      keys,
      extensions: [
        new x509.SubjectAlternativeNameExtension([
          new x509.GeneralName('url', this.#settings.X509_SAN_URL()),
        ]),
      ],
    });

    if (encoding === 'DER') {
      return cert.rawData;
    } else {
      return cert.toString('pem');
    }
  }

  /**
   * Generate a public key from the private key.
   * @returns  The public key.
   */
  get publicKey(): COSEKey {
    const jwk = this.privateKey.toJWK();
    const publicKey = { ...jwk, key_ops: ['verify'] };
    delete publicKey.d;
    const coseKey = COSEKey.fromJWK(publicKey);
    coseKey.set(COSEKeyParam.KeyOps, [2]);
    return coseKey;
  }

  /**
   * Convert the private key to a CryptoKey.
   * @returns The private key as a CryptoKey.
   */
  get privateCryptoKey(): Promise<CryptoKey> {
    const jwk = this.privateKey.toJWK();
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign']
    );
  }

  /**
   * Convert the public key to a CryptoKey.
   * @returns The public key as a CryptoKey.
   */
  get publicCryptoKey(): Promise<CryptoKey> {
    const jwk = this.publicKey.toJWK();
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['verify']
    );
  }
}
