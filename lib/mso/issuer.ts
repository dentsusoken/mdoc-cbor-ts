import {
  Algorithms,
  COSEKey,
  Headers,
  ProtectedHeaders,
  Sign1,
  UnprotectedHeaders,
} from '@auth0/cose';
import { Tag, encode } from 'cbor-x';
import crypto from 'crypto';
import { JWK } from 'jose';
import { nanoid } from 'nanoid';
import * as settings from '../settings';
import { shuffleDict } from '../tools';
import { DisclosureMap, HashMap } from '../types';
import { MsoX509Fabric } from '../x509';

/**
 * MsoIssuer is class that provides methods to generate MSO (Mobile Security Object).
 * @property {Record<string, unknown>} data The data to be included in the MSO document.
 * @property {JWK} publicKey The public key of the issuer.
 * @property {HashMap} hashMap The hash map of the data.
 * @property {DisclosureMap} disclosureMap The disclosure map of the data.
 * @extends MsoX509Fabric
 */
export class MsoIssuer extends MsoX509Fabric {
  public publicKey: JWK;
  public hashMap: HashMap = {};
  public disclosureMap: DisclosureMap = {};

  /**
   * Creates an instance of MsoIssuer.
   * @param {Record<string, unknown>} data The data to be included in the MSO document.
   * @param {Uint8Array | COSEKey | JWK} privateKey The private key used to sign the MSO document.
   * @param {string} digestAlg The hash algorithm used to generate the hash map. Default is SHA-256.
   */
  constructor(
    public data: Record<string, unknown>,
    privateKey: Uint8Array | COSEKey | JWK,
    public digestAlg: string = settings.TSMDOC_HASHALG()
  ) {
    super(privateKey);
    this.publicKey = this.toPublicKey(privateKey);

    let digestCnt = 0;

    Object.entries(data).forEach(([ns, values]) => {
      this.disclosureMap[ns] = {};
      this.hashMap[ns] = {};
      if (typeof values !== 'object') {
        throw new Error('Invalid data type');
      }
      Object.entries(shuffleDict(values as Record<string, unknown>)).forEach(
        async ([k, v]) => {
          const rndSalt = nanoid(settings.DIGEST_SALT_LENGTH);
          const valueCborTag = settings.CBORTAGS_ATTR_MAP[k];

          if (valueCborTag) {
            v = new Tag(v, valueCborTag);
          }

          this.disclosureMap[ns][digestCnt] = {
            digestID: digestCnt,
            random: rndSalt,
            elementIdentifier: k,
            elementValue: v,
          };
          this.hashMap[ns][digestCnt] = await crypto.subtle.digest(
            settings.TSMDOC_HASHALG(),
            encode(new Tag(encode(this.disclosureMap[ns][digestCnt]), 24))
          );

          digestCnt += 1;
        }
      );
    });
  }

  /**
   * Signs the MSO document.
   * @param {Record<string, unknown>} deviceKey The device key to be included in the MSO document.
   * @param {number | Date} validFrom The validity start date of the MSO document.
   * @param {string} doctype The document type of the MSO document.
   * @returns {Promise<Sign1>} The signed MSO document.
   */
  async sign(
    deviceKey?: Record<string, unknown>,
    validFrom?: number | Date,
    doctype?: string
  ) {
    const utcnow = Date.now();
    let exp = 0;
    if (settings.TSMDOC_EXP_DELTA_HOURS()) {
      exp = utcnow + settings.TSMDOC_EXP_DELTA_HOURS() * 3600;
    } else {
      exp = utcnow + 365 * 24 * 3600 * 5;
    }

    const payload = {
      version: '1.0',
      digestAlgorithm: settings.HASHALG_MAP[settings.TSMDOC_HASHALG()],
      valueDigests: this.hashMap,
      deviceKeyInfo: {
        deviceKey: deviceKey,
      },
      docType: doctype || this.hashMap[0],
      validityInfo: {
        signed: encode(new Tag(this.formatDatetimeRepr(utcnow), 0)),
        validFrom: encode(
          new Tag(
            this.formatDatetimeRepr(
              (validFrom instanceof Date ? validFrom.getTime() : validFrom) ||
                utcnow
            ),
            0
          )
        ),
        validUntil: encode(new Tag(this.formatDatetimeRepr(exp), 0)),
      },
    };

    const cert = settings.X509_DER_CERT() || (await this.selfSignedX509Cert());

    const ph = new ProtectedHeaders();
    ph.set(
      Headers.Algorithm,
      this.getAlgorithm(this.toJWK(this.privateKey).alg)
    );
    ph.set(
      Headers.KeyID,
      new TextEncoder().encode(this.toJWK(this.privateKey).kid)
    );

    const uh = new UnprotectedHeaders();
    uh.set(
      Headers.X5Chain,
      cert instanceof ArrayBuffer
        ? new Uint8Array(cert)
        : new TextEncoder().encode(cert)
    );

    const mso = await Sign1.sign(
      ph,
      uh,
      encode(payload),
      await COSEKey.fromJWK(this.toJWK(this.privateKey)).toKeyLike()
    );

    return mso;
  }

  /**
   * Formats a date string.
   * @param {number} millisec The date in milliseconds.
   * @returns {string} The formatted date string.
   */
  private formatDatetimeRepr(millisec: number): string {
    const date = new Date(millisec);
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z/, 'Z');
  }

  /**
   * Returns the algorithm number.
   * @param {string} alg The algorithm name.
   * @returns {number} The algorithm number.
   */
  private getAlgorithm(alg?: string): number {
    switch (alg) {
      case 'ES256':
        return Algorithms.ES256;
      case 'ES384':
        return Algorithms.ES384;
      case 'ES512':
        return Algorithms.ES512;
      case 'PS256':
        return Algorithms.PS256;
      case 'PS384':
        return Algorithms.PS384;
      case 'PS512':
        return Algorithms.PS512;
      case 'RS256':
        return Algorithms.RS256;
      case 'RS384':
        return Algorithms.RS384;
      case 'RS512':
        return Algorithms.RS512;
      default:
        throw new Error('Unsupported algorithm');
    }
  }
}
