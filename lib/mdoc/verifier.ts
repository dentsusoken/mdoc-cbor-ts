import { decode } from 'cbor-x';
import { InvalidMdoc } from '../exceptions';
import { Dict } from '../types';
import { NoDocumentTypeProvided, NoSignedDocumentProvided } from './exceptions';
import { IssuerSigned } from './issuersigned';

/**
 * MobileDocument is a class that represents a mobile document.
 * It contains the issuerSigned and deviceSigned objects.
 * It also contains a method to verify the issuerSigned object.
 * @property {string} docType - The type of the document.
 * @property {IssuerSigned} issuerSigned - The issuer signed object.
 * @property {Dict} deviceSigned - The device signed object.
 * @property {boolean} isValid - A boolean that indicates if the issuerSigned object is valid.
 */
export class MobileDocument {
  public issuerSigned: IssuerSigned;
  public isValid: boolean = false;

  /**
   * Creates an instance of MobileDocument.
   * @param {string} docType The type of the document.
   * @param {Dict} issuerSigned The issuer signed object.
   * @param {Dict} [deviceSigned={}] The device signed object.
   */
  constructor(
    public docType: string,
    issuerSigned: Dict,
    public deviceSigned: Dict = {}
  ) {
    if (!docType) {
      throw new NoDocumentTypeProvided('You must provide a document type');
    }
    if (!issuerSigned) {
      throw new NoSignedDocumentProvided('You must provide a signed document');
    }
    const { nameSpaces, issuerAuth } = issuerSigned;
    this.issuerSigned = new IssuerSigned(
      nameSpaces as Dict,
      issuerAuth as Dict | Uint8Array
    );
  }

  /**
   * Verifies the issuerSigned object.
   * @returns {Promise<boolean>} A promise that resolves to a boolean.
   */
  async verify(): Promise<boolean> {
    this.isValid = await this.issuerSigned.issuerAuth.verifySignature();
    return this.isValid;
  }
}

/**
 * MdocCbor is a class that provides methods to handle a CBOR encoded mobile document.
 * @property {Uint8Array} dataAsBytes The data as bytes.
 * @property {Dict} dataAsCborDict The data as a CBOR dictionary.
 * @property {MobileDocument[]} documents The valid documents.
 * @property {MobileDocument[]} invalidDocuments The invalid documents.
 */
export class MdocCbor {
  public dataAsBytes: Uint8Array = new Uint8Array();
  public dataAsCborDict: Dict = {};
  public documents: MobileDocument[] = [];
  public invalidDocuments: MobileDocument[] = [];

  /**
   * Loads the data.
   * @param {Uint8Array | Buffer} data The data as bytes.
   */
  load(data: Uint8Array | Buffer) {
    this.dataAsBytes = data instanceof Buffer ? Uint8Array.from(data) : data;
    this.dataAsCborDict = decode(data);
  }

  /**
   * Loads the data from a hex string.
   * @param {string} data The data as a hex string.
   */
  loads(data: string) {
    this.load(Uint8Array.from(Buffer.from(data, 'hex')));
  }

  /**
   * Verifies the mobile document.
   * @returns {Promise<boolean>} A promise that resolves to a boolean.
   * @throws {InvalidMdoc} If the mobile document is invalid.
   */
  async verify(): Promise<boolean> {
    for (const i of ['version', 'documents']) {
      if (!Object.keys(this.dataAsCborDict).includes(i)) {
        throw new InvalidMdoc(
          `Mdoc is invalid since it doesn't contain the ${i} element`
        );
      }
    }

    let docCnt = 1;

    for (const doc of this.dataAsCborDict['documents'] as Dict[]) {
      const mso = new MobileDocument(
        doc['docType'] as string,
        doc['issuerSigned'] as Dict,
        doc['deviceSigned'] as Dict
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
      }
    }
    if (this.invalidDocuments.length > 0) {
      return false;
    }
    return true;
  }
}
