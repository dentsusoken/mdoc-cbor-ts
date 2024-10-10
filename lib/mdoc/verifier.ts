import { Buffer } from 'node:buffer';
import { InvalidMdoc } from '../exceptions';
import { MSOVerifier } from '../mso';
import { IssuerSigned, Mdoc } from '../types';
import { NoDocumentTypeProvided, NoSignedDocumentProvided } from './exceptions';

/**
 * MobileDocument is a class that represents a mobile document.
 * It contains the issuerSigned and deviceSigned objects.
 * It also contains a method to verify the issuerSigned object.
 * @property {string} docType - The type of the document.
 * @property {IssuerSigned} issuerSigned - The issuer signed object.
 * @property {Record<string, unknown>} deviceSigned - The device signed object.
 * @property {boolean} isValid - The validity of the document.
 * @property {MSOVerifier} issuerAuth - The MSO verifier object.
 */
export class MobileDocument {
  public isValid: boolean = false;
  public issuerAuth: MSOVerifier;

  /**
   * Creates an instance of MobileDocument.
   * @param {string} docType The type of the document.
   * @param {IssuerSigned} issuerSigned The issuer signed object.
   * @param {Record<string, unknown>} deviceSigned The device signed object.
   */
  constructor(
    public docType: string | undefined,
    public issuerSigned: IssuerSigned,
    public deviceSigned: Record<string, unknown> = {}
  ) {
    if (!docType) {
      throw new NoDocumentTypeProvided('You must provide a document type');
    }
    if (!issuerSigned) {
      throw new NoSignedDocumentProvided('You must provide a signed document');
    }
    this.issuerSigned = issuerSigned;
    this.issuerAuth = new MSOVerifier(issuerSigned.issuerAuth);
  }

  /**
   * Verifies the issuerSigned object.
   * @returns {Promise<boolean>} A promise that resolves to a boolean.
   */
  async verify(): Promise<boolean> {
    this.isValid = await this.issuerAuth.verify();
    return this.isValid;
  }
}

/**
 * MdocCbor is a class that provides methods to handle a CBOR encoded mobile document.
 * @property {MobileDocument[]} documents The valid documents.
 * @property {MobileDocument[]} invalidDocuments The invalid documents.
 */
export class MdocCbor {
  public documents: MobileDocument[] = [];
  public invalidDocuments: MobileDocument[] = [];
  #mdoc?: Mdoc;

  /**
   * Loads the data.
   * @param {Uint8Array | Buffer} data The data as bytes.
   */
  load(data: Uint8Array | Buffer) {
    this.#mdoc = Mdoc.decode(data);
  }

  /**
   * Loads the data from a hex string.
   * @param {string} data The data as a hex string.
   */
  loadHex(data: string) {
    this.load(Uint8Array.from(Buffer.from(data, 'hex')));
  }
  /**
   * Loads the data from a base64 string.
   * @param {string} data The data as a hex string.
   */
  loadBase64(data: string) {
    this.load(Buffer.from(data, 'base64'));
  }
  /**
   * Loads the data from a base64url string.
   * @param {string} data The data as a hex string.
   */
  loadBase64Url(data: string) {
    this.load(Buffer.from(data, 'base64url'));
  }

  /**
   * Verifies the mobile document.
   * @returns {Promise<boolean>} A promise that resolves to a boolean.
   * @throws {InvalidMdoc} If the mobile document is invalid.
   */
  async verify(): Promise<boolean> {
    if (!this.#mdoc) {
      throw new InvalidMdoc('Mdoc is invalid since it is not loaded');
    }
    for (const i of ['version', 'documents']) {
      if (!Object.keys(this.#mdoc).includes(i)) {
        throw new InvalidMdoc(
          `Mdoc is invalid since it doesn't contain the ${i} element`
        );
      }
    }

    let docCnt = 1;

    for (const doc of this.#mdoc.documents) {
      const mso = new MobileDocument(
        doc.docType,
        doc.issuerSigned,
        doc.deviceSigned
      );

      try {
        if (await mso.verify()) {
          this.documents.push(mso);
        } else {
          this.invalidDocuments.push(mso);
        }
      } catch (e) {
        console.error(`
        COSE Sign1 validation failed to the document number #${docCnt}. 
        Then it is appended to self.documents_invalid: ${e}
        `);
        return false;
      }
    }
    if (this.invalidDocuments.length > 0) {
      return false;
    }
    return true;
  }
}
