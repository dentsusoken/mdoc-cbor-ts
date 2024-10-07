import { encode } from 'cbor-x';
import { MsoIssuer } from '../mso/issuer';
import { IssuerSigned, IssuerSignedJSON } from './IssuerSigned';

/**
 * DocumentDict is a dictionary that contains the document type and the MSO issuer.
 */
export type DocumentDict = {
  doctype: string;
  msoi: MsoIssuer;
};

export interface DocumentJSON {
  docType?: string;
  issuerSigned: IssuerSignedJSON;
}

/**
 * Document is a class that provides methods to generate a document.
 * @property {string} docType - The document type.
 * @property {IssuerSigned} issuerSigned - The issuer signed data.
 * @property {Record<string, unknown>} deviceSigned - The device signed data.
 */
export class Document {
  /**
   * Create a new Document instance.
   * @param {string} docType - The document type.
   * @param {IssuerSigned} issuerSigned - The issuer signed data.
   * @param {Record<string, unknown>} deviceSigned - The device signed data.
   * @returns {Document} The Document instance.
   */
  private constructor(
    public docType: string | undefined,
    public issuerSigned: IssuerSigned,
    // TODO - Implement deviceSigned
    public deviceSigned: Record<string, unknown> = {}
  ) {}

  /**
   * Create a new Document instance.
   * @param {string} docType - The document type.
   * @param {MsoIssuer} msoi - The MSO issuer.
   * @returns {Promise<Document>} The Document instance.
   */
  static async new(docType: string | undefined, msoi: MsoIssuer) {
    return new Document(docType, await IssuerSigned.new(msoi));
  }

  /**
   * Convert the document to JSON.
   * @returns {DocumentJSON} The JSON object.
   */
  toJSON(): DocumentJSON {
    return this.docType
      ? {
          docType: this.docType,
          issuerSigned: this.issuerSigned.toJSON(),
        }
      : {
          issuerSigned: this.issuerSigned.toJSON(),
        };
  }

  /**
   * Convert the document to bytes.
   * @returns {Buffer} The encoded document.
   */
  encode() {
    return encode(this.toJSON());
  }

  /**
   * Convert the document to a string.
   * @returns {string} The encoded document.
   */
  static fromJSON(json: DocumentJSON) {
    return new Document(json.docType, IssuerSigned.fromJSON(json.issuerSigned));
  }
}
