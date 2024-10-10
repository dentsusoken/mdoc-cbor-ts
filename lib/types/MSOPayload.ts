import { decode, encode, Tag } from 'cbor-x';
import { DateTime } from 'luxon';
import { HashMap } from './HashMap';

/**
 * DeviceKeyInfo is the device key information.
 */
export interface DeviceKeyInfo {
  deviceKey: unknown;
}

/**
 * validity information.
 */
export interface validityInfo {
  signed: DateTime;
  validFrom: DateTime;
  validUntil: DateTime;
}

/**
 * Constructor parameters for MSOPayload.
 */
export interface MSOPayloadOptions {
  digestAlgorithm: string;
  valueDigests: HashMap;
  docType: string;
  validityInfo: validityInfo;
  deviceKeyInfo?: DeviceKeyInfo;
}

/**
 * Decodable JSON for MSOPayload.
 */
export type MSODecodableJSON = Omit<MSOPayloadOptions, 'validityInfo'> & {
  validityInfo: {
    signed: Date;
    validFrom: Date;
    validUntil: Date;
  };
};

/**
 * MSOPayload is a class that provides methods to generate a MSO payload.
 * @property {string} version - The version.
 * @property {string} digestAlgorithm - The digest algorithm.
 * @property {HashMap} valueDigests - The value digests.
 * @property {DeviceKeyInfo} deviceKeyInfo - The device key information.
 * @property {string} docType - The document type.
 * @property {validityInfo} validityInfo - The validity information.
 */
export class MSOPayload {
  public readonly version: string = '1.0';
  public readonly digestAlgorithm: string;
  public readonly valueDigests: HashMap;
  public readonly deviceKeyInfo?: DeviceKeyInfo = undefined;
  public readonly docType: string;
  public readonly validityInfo: validityInfo;

  /**
   * Create a new MSOPayload instance.
   * @param {MSOPayloadOptions} options - The MSOPayload options.
   * @returns {MSOPayload} The MSOPayload instance.
   */
  constructor({
    digestAlgorithm,
    valueDigests,
    docType,
    validityInfo,
    deviceKeyInfo,
  }: MSOPayloadOptions) {
    this.digestAlgorithm = digestAlgorithm;
    this.valueDigests = valueDigests;
    this.docType = docType;
    this.validityInfo = validityInfo;
    this.deviceKeyInfo = deviceKeyInfo;
  }

  /**
   * Format the date.
   * @param {DateTime} date - The date.
   * @returns {string} The formatted date.
   */
  private formatDate(date: DateTime) {
    return date.toISO()?.split('.')[0] + 'Z';
  }

  /**
   * Encode the MSOPayload to CBOR.
   * @returns {Uint8Array} The encoded MSOPayload.
   */
  public encode() {
    return encode({
      version: this.version,
      digestAlgorithm: this.digestAlgorithm,
      valueDigests: this.valueDigests,
      deviceKeyInfo: this.deviceKeyInfo,
      docType: this.docType,
      validityInfo: {
        signed: encode(new Tag(this.formatDate(this.validityInfo.signed), 0)),
        validFrom: encode(
          new Tag(this.formatDate(this.validityInfo.validFrom), 0)
        ),
        validUntil: encode(
          new Tag(this.formatDate(this.validityInfo.validUntil), 0)
        ),
      },
    });
  }

  /**
   * Convert the MSOPayload to JSON.
   * @param {MSODecodableJSON | Tag} data - The MSOPayload json object.
   * @returns {MSOPayloadOptions} The JSON object.
   */
  static decode(data: MSODecodableJSON | Tag) {
    // TODO - Confirm which type is correct
    if (data instanceof Tag) {
      data = decode(data.value) as MSODecodableJSON;
    }
    return new MSOPayload({
      digestAlgorithm: data.digestAlgorithm,
      valueDigests: data.valueDigests,
      docType: data.docType,
      deviceKeyInfo: data.deviceKeyInfo,
      validityInfo: {
        signed: DateTime.fromJSDate(data.validityInfo.signed),
        validFrom: DateTime.fromJSDate(data.validityInfo.validFrom),
        validUntil: DateTime.fromJSDate(data.validityInfo.validUntil),
      },
    });
  }
}
