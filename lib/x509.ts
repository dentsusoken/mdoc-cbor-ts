import { COSEKey } from '@auth0/cose';
import asn1js from 'asn1js';
import crypto from 'crypto';
import { JWK } from 'jose';
import nodeForge from 'node-forge';
import pkijs from 'pkijs';
import pvutils from 'pvutils';
import * as settings from './settings';

/**
 * MsoX509Fabric is a class that provides methods to generate X509 certificates.
 * @property {COSEKey | JWK} privateKey The private key used to sign the certificate.
 */
export class MsoX509Fabric {
  constructor(protected privateKey: Uint8Array | COSEKey | JWK) {}

  /**
   * Generates a self-signed X509 certificate.
   * @param {string} encoding The encoding of the certificate. Default is DER.
   * @returns {Promise<ArrayBuffer | string>} The self-signed X509 certificate.
   */
  async selfSignedX509Cert(
    encoding: 'DER' | 'PEM' = 'DER'
  ): Promise<ArrayBuffer | string> {
    const cert = new pkijs.Certificate();
    cert.version = 3;
    cert.subjectPublicKeyInfo.importKey(
      await this.jwkToCryptoKey(this.toPublicKey(this.privateKey), false)
    );

    cert.serialNumber = asn1js.Integer.fromBigInt(this.randomSerialNumber());
    cert.notBefore.value = settings.X509_NOT_VALID_BEFORE();
    cert.notAfter.value = settings.X509_NOT_VALID_AFTER();

    const attrs = [
      new pkijs.AttributeTypeAndValue({
        type: '2.5.4.6',
        value: new asn1js.Utf8String({ value: settings.X509_COUNTRY_NAME() }),
      }),
      new pkijs.AttributeTypeAndValue({
        type: '2.5.4.8',
        value: new asn1js.Utf8String({
          value: settings.X509_STATE_OR_PROVINCE_NAME(),
        }),
      }),
      new pkijs.AttributeTypeAndValue({
        type: '2.5.4.7',
        value: new asn1js.Utf8String({
          value: settings.X509_LOCALITY_NAME(),
        }),
      }),
      new pkijs.AttributeTypeAndValue({
        type: '2.5.4.10',
        value: new asn1js.Utf8String({
          value: settings.X509_ORGANIZATION_NAME(),
        }),
      }),
      new pkijs.AttributeTypeAndValue({
        type: '2.5.4.3',
        value: new asn1js.Utf8String({
          value: settings.X509_COMMON_NAME(),
        }),
      }),
      new pkijs.AttributeTypeAndValue({
        type: '2.5.4.3',
        value: new asn1js.Utf8String({
          value: settings.X509_COMMON_NAME(),
        }),
      }),
    ];

    cert.subject.typesAndValues = attrs;
    cert.issuer.typesAndValues = attrs;
    const subjectAltName = new pkijs.AltName({
      altNames: [
        new pkijs.GeneralName({
          type: 6,
          value: settings.X509_SAN_URL(),
        }),
      ],
    });
    cert.extensions = [
      new pkijs.Extension({
        extnID: '2.5.29.8',
        critical: false,
        extnValue: subjectAltName.toSchema().toBER(false),
        parsedValue: subjectAltName,
      }),
    ];
    await cert.sign(
      await this.jwkToCryptoKey(this.privateKey, true),
      'SHA-256'
    );
    switch (encoding) {
      case 'DER':
        const der = cert.toSchema(true).toBER(false);
        return der;
      case 'PEM':
      default:
        const pem = pvutils.toBase64(
          pvutils.arrayBufferToString(cert.toSchema(true).toBER(false))
        );
        return `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----`;
    }
  }

  /**
   * Generates a random serial number.
   * @returns {bigint} The random serial number.
   */
  private randomSerialNumber(): bigint {
    const randomBytes = nodeForge.random.getBytesSync(20);
    let randomNumber = BigInt('0x' + nodeForge.util.bytesToHex(randomBytes));
    return randomNumber >> BigInt(1);
  }

  /**
   * Generates a public key from a private key.
   * @param {COSEKey | JWK} key The private key.
   * @returns {JWK} The public key.
   */
  private toPublicKey(key: Uint8Array | COSEKey | JWK): JWK {
    const privateKey =
      key instanceof Uint8Array
        ? COSEKey.import(key).toJWK()
        : key instanceof COSEKey
        ? key.toJWK()
        : key;
    privateKey.d = undefined;
    return privateKey;
  }

  /**
   * Converts a JWK or COSEKey to a CryptoKey.
   * @param {JWK | COSEKey} key The JWK or COSEKey.
   * @param {boolean} isPrivate Whether the key is a private key.
   * @returns {Promise<CryptoKey>} The CryptoKey.
   */
  private async jwkToCryptoKey(
    key: Uint8Array | COSEKey | JWK,
    isPrivate: boolean
  ): Promise<CryptoKey> {
    const jwk =
      key instanceof Uint8Array
        ? COSEKey.import(key).toJWK()
        : key instanceof COSEKey
        ? key.toJWK()
        : key;
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'ECDSA',
        namedCurve: jwk.crv,
      },
      true,
      isPrivate ? ['sign'] : ['verify']
    );
  }
}
