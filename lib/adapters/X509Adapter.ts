import { COSEKey } from '@auth0/cose';
import { JWK } from 'jose';
import { X509Certificate } from 'node:crypto';

/**
 * Adapter class for handling X.509 certificates and private keys
 * @description
 * A class that manages X.509 certificates and their associated private keys.
 * This adapter provides methods for importing certificates from JWK format
 * and accessing the certificate chain and private key.
 *
 * @example
 * ```typescript
 * const adapter = await X509Adapter.importJWKPrivateKey(jwk);
 * const cert = adapter.certificate;
 * const key = adapter.privateKey;
 * ```
 */
export class X509Adapter {
  #certificate: X509Certificate;
  #privateKey: COSEKey;

  /**
   * Creates a new X509Adapter instance
   * @param certificate - The X.509 certificate
   * @param privateKey - The private key associated with the certificate
   */
  constructor(certificate: X509Certificate, privateKey: COSEKey) {
    this.#certificate = certificate;
    this.#privateKey = privateKey;
  }

  /**
   * Gets the first certificate from the chain
   * @returns The first X.509 certificate
   */
  get certificate(): X509Certificate {
    return this.#certificate;
  }

  /**
   * Gets the private key associated with the certificate
   * @returns The COSE key containing the private key
   */
  get privateKey(): COSEKey {
    return this.#privateKey;
  }

  private static toPem(certificate: string): string {
    return `-----BEGIN CERTIFICATE-----\n${certificate}\n-----END CERTIFICATE-----`;
  }

  /**
   * Creates an X509Adapter instance from a JWK
   * @description
   * Imports a JSON Web Key (JWK) containing X.509 certificate chain and private key.
   * The method validates the presence of the certificate chain and creates
   * a new adapter instance with the imported data.
   *
   * @param jwk - The JSON Web Key containing certificate and private key data
   * @returns A Promise that resolves to a new X509Adapter instance
   * @throws {Error} If the certificate chain (x5c) is missing from the JWK
   */
  static async importJWKPrivateKey(jwk: JWK): Promise<X509Adapter> {
    if (!jwk.x5c || jwk.x5c.length === 0) {
      throw new Error('x5c is required');
    }
    const certificate = new X509Certificate(this.toPem(jwk.x5c[0]));
    return new X509Adapter(certificate, COSEKey.fromJWK(jwk));
  }
}
