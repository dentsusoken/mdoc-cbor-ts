import nodeForge from 'node-forge';
import * as settings from './settings';

/**
 * MsoX509Fabric is a class that provides methods to generate X509 certificates.
 */
export class MsoX509Fabric {
  /**
   * Generates a self-signed X509 certificate.
   * @param encoding The encoding of the certificate. Default is DER.
   * @returns The self-signed X509 certificate.
   */
  selfSignedX509Cert(encoding: 'DER' | 'PEM' = 'DER'): string {
    const pki = nodeForge.pki;
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = this.randomSerialNumber().toString();
    cert.validity.notBefore = settings.X509_NOT_VALID_BEFORE();
    cert.validity.notAfter = settings.X509_NOT_VALID_AFTER();

    const attrs = [
      {
        name: 'countryName',
        value: settings.X509_COUNTRY_NAME(),
        type: '2.5.4.6',
      },
      {
        name: 'ST',
        value: settings.X509_STATE_OR_PROVINCE_NAME(),
        type: '2.5.4.8',
      },
      {
        name: 'localityName',
        value: settings.X509_LOCALITY_NAME(),
        type: '2.5.4.7',
      },
      {
        name: 'organizationName',
        value: settings.X509_ORGANIZATION_NAME(),
        type: '2.5.4.10',
      },
      {
        name: 'commonName',
        value: settings.X509_COMMON_NAME(),
        type: '2.5.4.3',
      },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    cert.setExtensions([
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 6,
            value: settings.X509_SAN_URL(),
          },
        ],
      },
    ]);

    cert.sign(keys.privateKey, nodeForge.md.sha256.create());

    switch (encoding) {
      case 'DER':
        const derBuffer = nodeForge.asn1
          .toDer(pki.certificateToAsn1(cert))
          .getBytes();
        return nodeForge.util.encode64(derBuffer);
      case 'PEM':
      default:
        return pki.certificateToPem(cert);
    }
  }

  /**
   * Generates a random serial number.
   * @returns The random serial number.
   */
  private randomSerialNumber() {
    const randomBytes = nodeForge.random.getBytesSync(20);
    let randomNumber = BigInt('0x' + nodeForge.util.bytesToHex(randomBytes));
    return randomNumber >> BigInt(1);
  }
}
