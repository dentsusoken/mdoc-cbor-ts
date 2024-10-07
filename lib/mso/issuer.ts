import {
  COSEKey,
  COSEKeyParam,
  Headers,
  ProtectedHeaders,
  UnprotectedHeaders,
} from '@auth0/cose';
import { DateTime } from 'luxon';
import { Settings } from '../settings';
import { shuffleDict } from '../tools';
import {
  DisclosureMap,
  DisclosureMapItem,
  HashMap,
  HashMapItem,
  MSOPayload,
} from '../types';
import { MSO } from '../types/MSO';
import { MsoX509Fabric } from '../x509';

/**
 * MsoIssuer is class that provides methods to generate MSO (Mobile Security Object).
 * @property {Record<string, Record<string, unknown>>} data - The data to be included in the MSO.
 * @property {string} digestAlg - The digest algorithm used to hash the data.
 * @property {HashMap} hashMap - The hash map of the data.
 * @property {DisclosureMap} disclosureMap - The disclosure map of the data.
 *
 * @extends MsoX509Fabric
 */
export class MsoIssuer extends MsoX509Fabric {
  /**
   * Create a new MsoIssuer instance.
   * @param {Record<string, Record<string, unknown>>} data - The data to be included in the MSO.
   * @param {COSEKey} privateKey - The private key used to sign the MSO.
   * @param {Settings} settings - The settings to be used.
   * @param {string} digestAlg - The digest algorithm used to hash the data.
   * @param {HashMap} hashMap - The hash map of the data.
   * @param {DisclosureMap} disclosureMap - The disclosure map of the data.
   * @returns {MsoIssuer} The MsoIssuer instance.
   */
  private constructor(
    public readonly data: Record<string, Record<string, unknown>>,
    privateKey: COSEKey,
    settings: Settings = new Settings(),
    public digestAlg: string,
    public hashMap: HashMap,
    public disclosureMap: DisclosureMap
  ) {
    super(privateKey, settings);
  }

  /**
   * Create a new MsoIssuer instance.
   * @param {Record<string, Record<string, unknown>>} data - The data to be included in the MSO.
   * @param {COSEKey} privateKey - The private key used to sign the MSO.
   * @param {Settings} settings - The settings to be used.
   * @param {string} digestAlg - The digest algorithm used to hash the data.
   * @returns {Promise<MsoIssuer>} The MsoIssuer instance.
   */
  static async new(
    data: Record<string, Record<string, unknown>>,
    privateKey: COSEKey,
    settings: Settings = new Settings(),
    digestAlg?: string
  ) {
    const hashMap: HashMap = {};
    const disclosureMap: DisclosureMap = {};
    const alg = digestAlg ?? settings.TSMDOC_HASHALG();

    let digestCnt = 0;

    for (const [ns, values] of Object.entries(shuffleDict(data))) {
      disclosureMap[ns] = {};
      hashMap[ns] = {};
      for (const [k, v] of Object.entries(values)) {
        const disclosureMapItem = new DisclosureMapItem(digestCnt, k, v);
        disclosureMap[ns][digestCnt] = disclosureMapItem;
        const hashMapItem = new HashMapItem(disclosureMapItem);
        hashMap[ns][digestCnt] = await hashMapItem.digest(alg);

        digestCnt++;
      }
    }

    return new MsoIssuer(
      data,
      privateKey,
      settings,
      alg,
      hashMap,
      disclosureMap
    );
  }

  /**
   * Sign the MSO.
   * @param {COSEKey} deviceKey - The device key to be included in the MSO.
   * @param {DateTime} valid_from - The date and time from which the MSO is valid.
   * @param {string} docType - The type of document to be signed.
   * @returns {Promise<Uint8Array>} The signed MSO.
   */
  async sign(deviceKey?: COSEKey, valid_from?: DateTime, docType?: string) {
    const now = DateTime.now();
    const exp = this.settings.TSMDOC_EXP_DELTA_HOURS()
      ? now.plus({
          hours: this.settings.TSMDOC_EXP_DELTA_HOURS(),
        })
      : now.plus({
          year: 5,
        });

    const payload = new MSOPayload({
      digestAlgorithm: this.digestAlg,
      valueDigests: this.hashMap,
      docType: docType ?? Object.keys(this.hashMap)[0],
      validityInfo: {
        signed: now,
        validFrom: valid_from ?? now,
        validUntil: exp,
      },
      deviceKeyInfo: deviceKey ? { deviceKey } : undefined,
    });

    const cert = this.settings.X509_DER_CERT()
      ? new TextEncoder().encode(this.settings.X509_DER_CERT())
      : await this.selfsignedX509Cert('DER');

    const mso = new MSO(
      this.createProtectedHeader(),
      this.createUnprotectedHeader(cert),
      payload
    );

    return mso.sign(await this.privateCryptoKey);
  }

  /**
   * Create the protected header of the MSO.
   * @returns {ProtectedHeaders} The protected header of the MSO.
   */
  private createProtectedHeader() {
    const protectedHeader = new ProtectedHeaders();
    protectedHeader.set(
      Headers.Algorithm,
      this.privateKey.get(COSEKeyParam.Algorithm)!
    );
    protectedHeader.set(
      Headers.KeyID,
      this.privateKey.get(COSEKeyParam.KeyID)!
    );
    return protectedHeader;
  }

  /**
   * Create the unprotected header of the MSO.
   * @param {ArrayBuffer} cert - The X509 certificate to be included in the MSO.
   * @returns {UnprotectedHeaders} The unprotected header of the MSO.
   */
  private createUnprotectedHeader(cert: ArrayBuffer) {
    const unprotectedHeader = new UnprotectedHeaders();
    unprotectedHeader.set(Headers.X5Chain, new Uint8Array(cert));
    return unprotectedHeader;
  }
}
