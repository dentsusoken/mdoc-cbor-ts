import { COSEKey } from '@auth0/cose';
import { Tag, encode } from 'cbor-x';
import { JWK } from 'jose';
import { MsoIssuer } from '../mso/issuer';
import { Dict, MdocData } from '../types';

/**
 * MdocCborIssuer is class that provides methods to generate mdoc.
 * @property {string} version The version of the mdoc document.
 * @property {number} status The status of the mdoc document.
 * @property {COSEKey} privateKey The private key of the issuer.
 * @property {Record<string, unknown>} signed The signed mdoc document.
 */
export class MdocCborIssuer {
  public version: string = '1.0';
  public status: number = 0;
  private privateKey: COSEKey;
  public signed: Record<string, unknown> = {};

  /**
   * Creates an instance of MdocCborIssuer.
   * @param {Uint8Array | COSEKey | JWK} privateKey The private key used to sign the mdoc document.
   */
  constructor(privateKey: Uint8Array | COSEKey | JWK) {
    this.privateKey =
      privateKey instanceof Uint8Array
        ? COSEKey.import(privateKey)
        : privateKey instanceof COSEKey
        ? privateKey
        : COSEKey.fromJWK(privateKey);
  }

  /**
   * Generates a new mdoc document.
   * @param {Record<string, unknown> | MdocData[]} data The data to be included in the mdoc document.
   * @param {Uint8Array | COSEKey | JWK} deviceKeyinfo The public key of the device.
   * @param {string} doctype The type of the document.
   * @returns {Promise<Record<string, unknown>>} The signed mdoc document.
   */
  async new(
    data: Dict | MdocData[],
    deviceKeyinfo: Uint8Array | JWK | COSEKey,
    doctype?: string
  ) {
    // TODO - confirm if this is necessary or not.
    // @ts-ignore
    const cosekey =
      deviceKeyinfo instanceof Uint8Array
        ? COSEKey.import(deviceKeyinfo)
        : deviceKeyinfo instanceof COSEKey
        ? deviceKeyinfo
        : COSEKey.fromJWK(deviceKeyinfo);

    const arrData: MdocData[] = Array.isArray(data)
      ? data
      : [{ doctype, data }];

    const documents = arrData.map(async (doc) => {
      const msoi = new MsoIssuer(doc.data, this.privateKey);
      const mso = await msoi.sign();

      const document = {
        docType: doc['doctype'],
        issuerSigned: {
          nameSpaces: {
            ...Object.fromEntries(
              Object.entries(msoi.disclosureMap).map(([ns, dgst]) => {
                return [
                  ns,
                  Object.entries(dgst).map(([k, v]) => {
                    return new Tag({ [k]: v }, 24);
                  }),
                ];
              })
            ),
          },
          issuerAuth: mso.encode(),
        },
      };

      return document;
    });

    this.signed = {
      version: this.version,
      status: this.status,
      documents: await Promise.all(documents),
    };

    return this.signed;
  }

  /**
   * Dumps the mdoc document.
   * @returns {Uint8Array} The mdoc document.
   */
  dump() {
    return encode(this.signed);
  }

  /**
   * Dumps the mdoc document in hex format.
   * @returns {string} The mdoc document in hex format.
   */
  dumps() {
    return encode(this.signed).toString('hex');
  }
}
