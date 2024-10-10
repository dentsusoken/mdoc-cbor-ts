import {
  Headers,
  ProtectedHeaders,
  Sign1,
  UnprotectedHeaders,
} from '@auth0/cose';
import * as x509 from '@peculiar/x509';
import { decode } from 'cbor-x';
import { Buffer } from 'node:buffer';
import { bytes2CoseSign1, cborlist2CoseSign1 } from '../tools';
import { MSOPayload } from './MSOPayload';

/**
 * MSO is a class that provides methods to generate a MSO.
 * @property {ProtectedHeaders} protectedHeader - The protected header.
 * @property {UnprotectedHeaders} unprotectedHeader - The unprotected header.
 * @property {MSOPayload} payload - The payload.
 * @property {Uint8Array} signature - The signature.
 * @property {Sign1} sign1 - The sign1.
 */
export class MSO {
  /**
   * Create a new MSO instance.
   * @param {ProtectedHeaders} protectedHeader - The protected header.
   * @param {UnprotectedHeaders} unprotectedHeader - The unprotected header.
   * @param {MSOPayload} payload - The payload.
   * @param {Uint8Array} signature - The signature.
   * @param {Sign1} sign1 - The sign1.
   * @returns {MSO} The MSO instance.
   */
  constructor(
    public readonly protectedHeader: ProtectedHeaders,
    public readonly unprotectedHeader: UnprotectedHeaders,
    public readonly payload: MSOPayload,
    public signature?: Uint8Array,
    public sign1?: Sign1
  ) {}

  /**
   * Sign the MSO with the private key.
   * @returns {Promise<Sign1>} The Sign1 instance.
   */
  async sign(privateKey: CryptoKey): Promise<Sign1> {
    this.sign1 = await Sign1.sign(
      this.protectedHeader,
      this.unprotectedHeader,
      this.payload.encode(),
      privateKey
    );
    this.signature = this.sign1.signature;
    return this.sign1;
  }

  /**
   * Get the x5Chain from the headers.
   * @returns {x509.X509Certificate[]} The x5Chain.
   */
  get x5Chain(): x509.X509Certificate[] {
    const mixedHeaders = Object.fromEntries([
      ...this.protectedHeader,
      ...this.unprotectedHeader,
    ]);
    const certs = Object.entries(mixedHeaders)
      .filter(([key, _]) => key === Headers.X5Chain.toString())
      .flatMap(([_, value]) => {
        if (Array.isArray(value)) {
          return value.map((c) => new x509.X509Certificate(c as Uint8Array));
        }
        return new x509.X509Certificate(value as Uint8Array);
      });
    return certs;
  }

  /**
   * Decode the MSO from bytes.
   * @param {string | Uint8Array} data - The CBOR encoded MSO.
   * @returns {MSO} The MSO instance.
   */
  static decode(
    data: string | Uint8Array | ConstructorParameters<typeof Sign1>
  ) {
    const sign1 = Array.isArray(data)
      ? cborlist2CoseSign1([
          data[0],
          new Map<number, unknown>(
            data[1] instanceof Map
              ? data[1].entries()
              : Object.entries(data[1] as Record<string, unknown>).map(
                  ([k, v]) => [Number(k), v]
                )
          ),
          data[2],
          data[3],
        ])
      : bytes2CoseSign1(
          Uint8Array.from(
            typeof data === 'string' ? Buffer.from(data, 'hex') : data
          )
        );
    const payload = decode(sign1.payload);
    return new MSO(
      sign1.protectedHeaders as unknown as ProtectedHeaders,
      sign1.unprotectedHeaders as unknown as UnprotectedHeaders,
      MSOPayload.decode(payload),
      sign1.signature,
      sign1
    );
  }

  /**
   * Verify the MSO with the public key.
   * @param {CryptoKey} publicKey - The public key.
   * @returns {Promise<boolean>} The verification result.
   */
  async verify(publicKey: CryptoKey) {
    if (!this.sign1) {
      return false;
    }
    try {
      await this.sign1.verify(publicKey);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
