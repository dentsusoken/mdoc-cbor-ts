import { describe, it, expect } from 'vitest';
import { verifyDeviceSignedDocument } from '../verifyDeviceSignedDocument';
import { buildIssuerSigned } from '@/handlers/issue/mdoc/buildIssuerSigned';
import { buildDeviceSigned } from '@/handlers/issue/mdoc/buildDeviceSigned';
import { createDocument } from '@/schemas/mdoc/Document';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { SessionTranscript } from '@/mdoc/types';
import { nameSpacesRecordToMap } from '@/mdoc/nameSpacesRecordToMap';
import { createTag24 } from '@/cbor/createTag24';
import { createSelfSignedCertificate } from '@/x509/createSelfSignedCertificate';
import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { Document } from '@/schemas/mdoc/Document';

const p256 = createSignatureCurve('P-256', randomBytes);

const buildValidDeviceSignedDocument = (
  docType: string,
  sessionTranscript: SessionTranscript
): Document => {
  // Create device key pair
  const devicePrivateKey = p256.randomPrivateKey();
  const devicePublicKey = p256.getPublicKey(devicePrivateKey);
  const deviceJwkPrivateKey = p256.toJwkPrivateKey(devicePrivateKey);
  const deviceJwkPublicKey = p256.toJwkPublicKey(devicePublicKey);

  // Create issuer key pair
  const issuerPrivateKey = p256.randomPrivateKey();
  const issuerPublicKey = p256.getPublicKey(issuerPrivateKey);
  const issuerJwkPrivateKey = p256.toJwkPrivateKey(issuerPrivateKey);
  const issuerJwkPublicKey = p256.toJwkPublicKey(issuerPublicKey);

  // Create issuer certificate
  const cert = createSelfSignedCertificate({
    subjectJwkPublicKey: issuerJwkPublicKey,
    caJwkPrivateKey: issuerJwkPrivateKey,
    subject: 'Issuer',
    serialHex: '11',
    digestAlgorithm: 'SHA-256',
  });
  const x5chain = certificateToDerBytes(cert);

  // Build issuer-signed structure
  const nameSpaces = nameSpacesRecordToMap({
    'org.iso.18013.5.1': {
      given_name: 'Alice',
      age: 30,
    },
  });

  const signed = new Date();
  const validFrom = new Date(signed.getTime());
  const validUntil = new Date(signed.getTime() + 24 * 60 * 60 * 1000);

  const issuerSigned = buildIssuerSigned({
    docType,
    nameSpaces,
    randomBytes,
    deviceJwkPublicKey,
    digestAlgorithm: 'SHA-256',
    signed,
    validFrom,
    validUntil,
    x5chain,
    issuerJwkPrivateKey,
  });

  // Build device-signed structure
  const deviceNameSpaces = new Map<string, Map<string, unknown>>([
    ['org.iso.18013.5.1', new Map([['given_name', 'Alice']])],
  ]);
  const nameSpacesBytes = createTag24(deviceNameSpaces);

  const deviceSigned = buildDeviceSigned({
    sessionTranscript,
    docType,
    nameSpacesBytes,
    deviceJwkPrivateKey,
  });

  // Create complete document
  return createDocument([
    ['docType', docType],
    ['issuerSigned', issuerSigned],
    ['deviceSigned', deviceSigned],
  ]);
};

describe('verifyDeviceSignedDocument', () => {
  const sessionTranscript: SessionTranscript = [null, null, new Map()];
  const docType = 'org.iso.18013.5.1.mDL';

  describe('success cases', () => {
    it('should verify a valid device-signed document', () => {
      const document = buildValidDeviceSignedDocument(
        docType,
        sessionTranscript
      );

      expect(() => {
        verifyDeviceSignedDocument({
          deviceSignedDocument: document,
          sessionTranscript,
        });
      }).not.toThrow();
    });

    it('should verify with custom now and clockSkew', () => {
      const document = buildValidDeviceSignedDocument(
        docType,
        sessionTranscript
      );
      const now = new Date();
      const clockSkew = 120;

      expect(() => {
        verifyDeviceSignedDocument({
          deviceSignedDocument: document,
          sessionTranscript,
          now,
          clockSkew,
        });
      }).not.toThrow();
    });

    it('should verify with different session transcript values', () => {
      const sessionTranscriptWithValues: SessionTranscript = [
        new Uint8Array([1, 2, 3]),
        new Uint8Array([4, 5, 6]),
        new Map([['handoverType', 1]]),
      ];

      const document = buildValidDeviceSignedDocument(
        docType,
        sessionTranscriptWithValues
      );

      expect(() => {
        verifyDeviceSignedDocument({
          deviceSignedDocument: document,
          sessionTranscript: sessionTranscriptWithValues,
        });
      }).not.toThrow();
    });
  });

  describe('error cases', () => {
    it('should throw ErrorCodeError when docType is missing', () => {
      const document = buildValidDeviceSignedDocument(
        docType,
        sessionTranscript
      );
      document.delete('docType');

      expect(() => {
        verifyDeviceSignedDocument({
          deviceSignedDocument: document,
          sessionTranscript,
        });
      }).toThrow(ErrorCodeError);

      try {
        verifyDeviceSignedDocument({
          deviceSignedDocument: document,
          sessionTranscript,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.DocTypeMissing);
      }
    });

    it('should throw ErrorCodeError when issuerSigned is missing', () => {
      const document = buildValidDeviceSignedDocument(
        docType,
        sessionTranscript
      );
      document.delete('issuerSigned');

      expect(() => {
        verifyDeviceSignedDocument({
          deviceSignedDocument: document,
          sessionTranscript,
        });
      }).toThrow(ErrorCodeError);

      try {
        verifyDeviceSignedDocument({
          deviceSignedDocument: document,
          sessionTranscript,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.IssuerSignedMissing);
      }
    });

    it('should throw ErrorCodeError when deviceSigned is missing', () => {
      const document = buildValidDeviceSignedDocument(
        docType,
        sessionTranscript
      );
      document.delete('deviceSigned');

      expect(() => {
        verifyDeviceSignedDocument({
          deviceSignedDocument: document,
          sessionTranscript,
        });
      }).toThrow(ErrorCodeError);

      try {
        verifyDeviceSignedDocument({
          deviceSignedDocument: document,
          sessionTranscript,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.DeviceSignedMissing);
      }
    });
  });
});
