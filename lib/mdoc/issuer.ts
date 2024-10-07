import { COSEKey } from '@auth0/cose';
import { encode } from 'cbor-x';
import { Settings } from '../settings';
import { DataDict, Mdoc } from '../types';

/**
 * MdocIssuer is a class that provides methods to generate MDOC (Mobile Document).
 * @property {string} version - The version of the MDOC.
 * @property {number} status - The status of the MDOC.
 * @property {Record<string, unknown>} signed - The signed data of the MDOC.
 *
 * @example
 * const mdoc = new MdocIssuer('...');
 * await mdoc.new({ ... });
 * console.log(mdoc.dump());
 */
export class MdocCborIssuer {
  public version: string = '1.0';
  public status: number = 0;
  public signed?: Record<string, unknown>;
  #privateKey: COSEKey;

  /**
   * Create a new MdocIssuer instance.
   * @param {COSEKey} privateKey - The private key used to sign the MDOC.
   * @returns {MdocIssuer} The MdocIssuer instance.
   */
  private constructor(privateKey: COSEKey) {
    this.#privateKey = privateKey;
  }

  /**
   * Create a new MdocIssuer instance.
   * @param {COSEKey} privateKey - The private key used to sign the MDOC.
   * @returns {MdocIssuer} The MdocIssuer instance.
   */
  async new(
    data: Record<string, Record<number, unknown>> | DataDict[],
    // deviceKeyInfo:COSEKey,
    docType?: string,
    settings: Settings = new Settings()
  ) {
    if (Array.isArray(data)) {
    }
    const mdoc = await Mdoc.new(
      this.version,
      Array.isArray(data) ? data : [{ docType: docType, data }],
      this.status,
      this.#privateKey,
      settings
    );

    this.signed = mdoc.toJSON();
  }

  /**
   * Convert mdoc to bytes.
   * @returns {Uint8Array} The dumped MDOC.
   */
  dump() {
    return encode(this.signed);
  }

  /**
   * Convert mdoc to hex string.
   * @returns {string} The dumped MDOC as a hex string.
   */
  dumps() {
    return encode(this.signed).toString('hex');
  }
}
