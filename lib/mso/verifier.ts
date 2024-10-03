import { COSEKey, Headers, Sign1 } from '@auth0/cose';
import { JWK } from 'jose';
import * as pkijs from 'pkijs';
import { MsoX509ChainNotFound, UnsupportedMsoDataFormat } from '../exceptions';
import { bytes2CoseSign1, cborlist2CoseSign1 } from '../tools';

/**
 * MsoVerifier is a class that provides methods to verify the signature of a MSO.
 * @property {Sign1} object The MSO object.
 * @property {COSEKey} publicKey The public key used to verify the signature.
 * @property {unknown[]} x509Certs The X509 certificates used to verify the signature.
 */
export class MsoVerifier {
  public object: Sign1;
  public publicKey?: COSEKey;
  public x509Certs: unknown[] = [];

  /**
   * Creates an instance of MsoVerifier.
   * @param {Uint8Array | ConstructorParameters<typeof Sign1>} data The MSO data.
   */
  constructor(data: Uint8Array | ConstructorParameters<typeof Sign1>) {
    if (data instanceof Uint8Array) {
      this.object = bytes2CoseSign1(data);
    } else if (Array.isArray(data)) {
      this.object = cborlist2CoseSign1(data);
    } else {
      throw new UnsupportedMsoDataFormat(
        `MsoParser only supports raw bytes and list, a ${typeof data} was provided`
      );
    }
  }

  /**
   * Iterates over the public keys in the MSO.
   * @returns {IterableIterator<unknown>} The public keys.
   */
  rowPublicKeys(): IterableIterator<unknown> {
    const mixedHeads = new Map([
      ...this.object.protectedHeaders,
      ...this.object.unprotectedHeaders,
    ]);

    if (mixedHeads.has(Headers.X5Chain)) {
      return this.object.unprotectedHeaders.values();
    } else {
      throw new MsoX509ChainNotFound(
        "I can't find any valid X509certs, identified by label number 33, in this MSO."
      );
    }
  }

  /**
   * Attests the public key.
   * This method is not implemented yet.
   * @returns {void}
   */
  attestPublicKey(): void {
    console.warn('Not Implemented yet');
  }

  /**
   * Loads the public key.
   * @returns {Promise<void>} A promise that resolves when the public key is loaded.
   */
  async loadPublicKey(): Promise<void> {
    this.attestPublicKey();

    this.rowPublicKeys();

    for (let value of this.rowPublicKeys()) {
      this.x509Certs.push(value);
    }
    const cert = pkijs.Certificate.fromBER(this.x509Certs[0] as BufferSource);
    const publicKey = await cert.getPublicKey();
    const jwk = await crypto.subtle.exportKey('jwk', publicKey);

    this.publicKey = COSEKey.fromJWK(jwk as JWK);
  }

  /**
   * Verifies the signature.
   * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the signature is valid.
   */
  async verifySignature(): Promise<boolean> {
    if (!this.publicKey) {
      await this.loadPublicKey();
    }
    if (!this.publicKey) {
      throw new Error('No public key found');
    }
    try {
      await this.object.verify(await this.publicKey.toKeyLike());
      return true;
    } catch (e) {
      return false;
    }
  }
}
