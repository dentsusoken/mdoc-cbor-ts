import * as x509 from '@peculiar/x509';
import { MSO } from '../types';

/**
 * MSOVerifier is a class that provides methods to verify MSO (Mobile Security Object).
 * @property {MSO} object - The MSO object to be verified.
 * @property {CryptoKey} publicKey - The public key used to verify the MSO.
 * @property {x509.X509Certificate[]} x509Certificates - The X509 certificates used to verify the MSO.
 *
 * @example
 * const mso = new MSOVerifier('...');
 * const verified = await mso.verify();
 * console.log(verified);
 */
export class MSOVerifier {
  public object: MSO;
  public publicKey?: CryptoKey = undefined;
  public x509Certificates?: x509.X509Certificate[] = undefined;

  /**
   * Create a new MSOVerifier instance.
   * @param {string | Uint8Array} data - The MSO data to be verified.
   * @returns {MSOVerifier} The MSOVerifier instance.
   */
  constructor(data: string | Uint8Array) {
    this.object = MSO.decode(data);
  }

  /**
   * Get the raw public keys from the MSO.
   * @returns {x509.X509Certificate[]} The raw public keys.
   */
  public rawPublicKeys() {
    const certs = this.object.x5Chain;
    this.x509Certificates = certs;
    return certs;
  }

  /**
   * Load the public key from the MSO.
   * @returns {Promise<CryptoKey>} The public key.
   */
  public async loadPublicKey() {
    const x509 = this.rawPublicKeys();
    this.publicKey = await x509[0].publicKey.export();
    return this.publicKey;
  }

  /**
   * Verify the MSO.
   * @returns {Promise<boolean>} The verification result.
   */
  public async verify() {
    if (!this.publicKey && !(this.publicKey = await this.loadPublicKey())) {
      throw new Error('public key not found');
    }

    return await this.object.verify(this.publicKey);
  }
}
