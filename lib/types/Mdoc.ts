import { COSEKey } from '@auth0/cose';
import { decode } from 'cbor-x';
import { MsoIssuer } from '../mso/issuer';
import { Settings } from '../settings';
import { Document, DocumentJSON } from './Document';

/**
 * DataDict is a dictionary that contains the document type and the data.
 */
export type DataDict = {
  docType?: string;
  data: Record<string, Record<number, unknown>>;
};

/**
 * Mdoc is a class that provides methods to generate a document.
 * @property {string} version - The version.
 * @property {Document[]} documents - The documents.
 * @property {number} status - The status.
 */
export class Mdoc {
  /**
   * Create a new Mdoc instance.
   * @param {string} version - The version.
   * @param {Document[]} documents - The documents.
   * @param {number} status - The status.
   * @returns {Mdoc} The Mdoc instance.
   */
  private constructor(
    public version: string,
    public documents: Document[],
    public status: number
  ) {}

  /**
   * Create a new Mdoc instance.
   * @param {string} version - The version.
   * @param {DataDict[]} data - The data.
   * @param {number} status - The status.
   * @param {COSEKey} privateKey - The private key.
   * @param {Settings} settings - The settings.
   * @returns {Promise<Mdoc>} The Mdoc instance.
   */
  static async new(
    version: string,
    data: DataDict[],
    status: number,
    privateKey: COSEKey,
    settings: Settings = new Settings()
  ) {
    const documents = data.map(
      async ({ docType, data }) =>
        await Document.new(
          docType,
          await MsoIssuer.new(data, privateKey, settings)
        )
    );

    return new Mdoc(version, await Promise.all(documents), status);
  }

  /**
   * Encode the Mdoc to bytes.
   * @returns {Uint8Array} The encoded Mdoc.
   */
  toJSON() {
    return {
      version: this.version,
      documents: this.documents.map((v) => v.toJSON()),
      status: this.status,
    };
  }

  /**
   * Decode the Mdoc from bytes.
   * @param {string | Uint8Array} cbor - The CBOR encoded Mdoc.
   * @returns {Mdoc} The Mdoc instance.
   */
  static decode(cbor: string | Uint8Array) {
    const raw = typeof cbor === 'string' ? Buffer.from(cbor, 'hex') : cbor;
    const uint8 = Uint8Array.from(raw);
    const data = decode(uint8);
    return new Mdoc(
      data.version,
      data.documents.map((v: DocumentJSON) => Document.fromJSON(v)),
      data.status
    );
  }
}
