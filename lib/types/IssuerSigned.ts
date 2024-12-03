import { Tag } from 'cbor-x';
import { MsoIssuer } from '../mso/issuer';
import { NameSpaces } from './NameSpaces';

export interface IssuerSignedJSON {
  nameSpaces: NameSpaces;
  issuerAuth: Uint8Array;
}

/**
 * IssuerSigned is a class that provides methods to generate issuer signed data.
 * @property {NameSpaces} nameSpaces - The name spaces.
 * @property {Uint8Array} issuerAuth - The issuer authentication.
 */
export class IssuerSigned {
  /**
   * Create a new IssuerSigned instance.
   * @param {NameSpaces} nameSpaces - The name spaces.
   * @param {Uint8Array} issuerAuth - The issuer authentication.
   * @returns {IssuerSigned} The IssuerSigned instance.
   */
  private constructor(
    public nameSpaces: NameSpaces,
    public issuerAuth: Uint8Array
  ) {}

  /**
   * Create a new IssuerSigned instance.
   * @param {MsoIssuer} msoi - The MSO issuer.
   * @returns {Promise<IssuerSigned>} The IssuerSigned instance.
   */
  static async new(msoi: MsoIssuer) {
    const mso = await msoi.sign();
    const nameSpaces: NameSpaces = {};

    for (const [ns, dgst] of Object.entries(msoi.disclosureMap)) {
      nameSpaces[ns] = [];
      for (const [_, v] of Object.entries(dgst)) {
        nameSpaces[ns].push(new Tag(v.toJSON(), 24));
      }
    }
    return new IssuerSigned(nameSpaces, mso.encode());
  }

  /**
   * Convert the issuer signed data to JSON.
   * @returns {IssuerSignedJSON} The JSON object.
   */
  toJSON(): IssuerSignedJSON {
    return {
      nameSpaces: this.nameSpaces,
      issuerAuth: this.issuerAuth,
    };
  }

  /**
   * Convert the issuer signed data to bytes.
   * @returns {Uint8Array} The encoded issuer signed data.
   */
  static fromJSON(json: IssuerSignedJSON) {
    return new IssuerSigned(json.nameSpaces, json.issuerAuth);
  }
}
