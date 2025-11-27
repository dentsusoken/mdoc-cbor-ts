import { describe, it, expect } from 'vitest';
import { buildDeviceResponse } from '../buildDeviceResponse';
import { buildMobileSecurityObject } from '@/handlers/issue/mso/buildMobileSecurityObject';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { Header, Algorithm } from '@/cose/types';
import { encodeCbor } from '@/cbor/codec';
import { createTag18 } from '@/cbor/createTag18';
import { Sign1 } from '@/cose/Sign1';
import { createSelfSignedCertificate } from '@/x509/createSelfSignedCertificate';
import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
import { MdocStatus } from '@/mdoc/types';
import { IssuerSigned, createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { Document, createDocument } from '@/schemas/mdoc/Document';
import { DcqlQuery } from '@/query-lang/dcql/schemas/DcqlQuery';
import { SessionTranscript } from '@/mdoc/types';

const p256 = createSignatureCurve('P-256', randomBytes);

const buildNameSpaces = (nameSpace: string): IssuerNameSpaces => {
  const item = createIssuerSignedItem([
    ['digestID', 1],
    ['random', new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])],
    ['elementIdentifier', 'given_name'],
    ['elementValue', 'Alice'],
  ]);
  const tag = createTag24(item);
  const map: Map<string, (typeof tag)[]> = new Map([[nameSpace, [tag]]]);
  return map;
};

const buildValidIssuerSigned = (docType: string): IssuerSigned => {
  // Extract nameSpace from docType (e.g., 'org.iso.18013.5.1.mDL' -> 'org.iso.18013.5.1')
  const nameSpace = docType.replace(/\.mDL$/, '');
  const nameSpaces = buildNameSpaces(nameSpace);

  const priv = p256.randomPrivateKey();
  const pub = p256.getPublicKey(priv);
  const jwkPriv = p256.toJwkPrivateKey(priv);
  const jwkPub = p256.toJwkPublicKey(pub);

  const signed = new Date();
  const validFrom = new Date(signed.getTime());
  const validUntil = new Date(signed.getTime() + 24 * 60 * 60 * 1000);

  const mso = buildMobileSecurityObject({
    docType,
    nameSpaces,
    deviceJwkPublicKey: jwkPub,
    digestAlgorithm: 'SHA-256',
    signed,
    validFrom,
    validUntil,
  });

  const cert = createSelfSignedCertificate({
    subjectJwkPublicKey: jwkPub,
    caJwkPrivateKey: jwkPriv,
    subject: 'Issuer',
    serialHex: '11',
    digestAlgorithm: 'SHA-256',
  });
  const der = certificateToDerBytes(cert);
  const ph = new Map<number, unknown>([[Header.Algorithm, Algorithm.ES256]]);
  const uh = new Map<number, unknown>([[Header.X5Chain, [der]]]);
  const payload = encodeCbor(createTag24(mso));

  const sign1 = Sign1.sign({
    protectedHeaders: encodeCbor(ph),
    unprotectedHeaders: uh,
    payload,
    jwkPrivateKey: jwkPriv,
  });

  return createIssuerSigned([
    ['nameSpaces', nameSpaces],
    ['issuerAuth', createTag18(sign1.getContentForEncoding())],
  ]);
};

const buildValidDocument = (docType: string): Document => {
  const issuerSigned = buildValidIssuerSigned(docType);
  return createDocument([
    ['docType', docType],
    ['issuerSigned', issuerSigned],
  ]);
};

describe('buildDeviceResponse', () => {
  const now = new Date();
  const clockSkew = 60;
  const devicePriv = p256.randomPrivateKey();
  const deviceJwkPrivateKey = p256.toJwkPrivateKey(devicePriv);
  const sessionTranscript: SessionTranscript = [null, null, new Map()];

  describe('success cases', () => {
    it('should build device response for a single credential', () => {
      const document = buildValidDocument('org.iso.18013.5.1.mDL');

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
      };

      const result = buildDeviceResponse({
        issuerSignedDocuments: [document],
        query,
        deviceJwkPrivateKey,
        sessionTranscript,
        now,
        clockSkew,
      });

      expect(result.size).toBe(1);
      expect(result.has('credential-1')).toBe(true);

      const mdoc = result.get('credential-1');
      expect(mdoc).toBeDefined();
      expect(mdoc!.get('version')).toBe('1.0');
      expect(mdoc!.get('status')).toBe(MdocStatus.OK);

      const documents = mdoc!.get('documents') as Document[];
      expect(documents).toBeDefined();
      expect(documents.length).toBe(1);

      const deviceSignedDocument = documents[0];
      expect(deviceSignedDocument.get('docType')).toBe('org.iso.18013.5.1.mDL');
      expect(deviceSignedDocument.get('issuerSigned')).toBeDefined();
      expect(deviceSignedDocument.get('deviceSigned')).toBeDefined();

      const documentErrors = mdoc!.get('documentErrors') as Array<
        Map<string, number>
      >;
      expect(documentErrors).toBeDefined();
      expect(documentErrors.length).toBe(0);
    });

    it('should build device response for multiple credentials', () => {
      const document1 = buildValidDocument('org.iso.18013.5.1.mDL');
      const document2 = buildValidDocument('org.iso.18013.5.2.mDL');

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
          {
            id: 'credential-2',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.2', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
      };

      const result = buildDeviceResponse({
        issuerSignedDocuments: [document1, document2],
        query,
        deviceJwkPrivateKey,
        sessionTranscript,
        now,
        clockSkew,
      });

      expect(result.size).toBe(2);
      expect(result.has('credential-1')).toBe(true);
      expect(result.has('credential-2')).toBe(true);

      const mdoc1 = result.get('credential-1');
      expect(mdoc1).toBeDefined();
      expect(mdoc1!.get('status')).toBe(MdocStatus.OK);

      const mdoc2 = result.get('credential-2');
      expect(mdoc2).toBeDefined();
      expect(mdoc2!.get('status')).toBe(MdocStatus.OK);
    });

    it('should include device nameSpaces when provided', () => {
      const document = buildValidDocument('org.iso.18013.5.1.mDL');

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
      };

      const deviceNameSpaces = new Map([
        ['org.iso.18013.5.1', new Map([['device_claim', 'device_value']])],
      ]);

      const result = buildDeviceResponse({
        issuerSignedDocuments: [document],
        query,
        deviceJwkPrivateKey,
        sessionTranscript,
        nameSpaces: deviceNameSpaces,
        now,
        clockSkew,
      });

      expect(result.size).toBe(1);
      const mdoc = result.get('credential-1');
      expect(mdoc).toBeDefined();
      expect(mdoc!.get('status')).toBe(MdocStatus.OK);
    });

    it('should use default now when not provided', () => {
      const document = buildValidDocument('org.iso.18013.5.1.mDL');

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
      };

      const result = buildDeviceResponse({
        issuerSignedDocuments: [document],
        query,
        deviceJwkPrivateKey,
        sessionTranscript,
        clockSkew,
      });

      expect(result.size).toBe(1);
      const mdoc = result.get('credential-1');
      expect(mdoc).toBeDefined();
      expect(mdoc!.get('status')).toBe(MdocStatus.OK);
    });

    it('should use default clockSkew when not provided', () => {
      const document = buildValidDocument('org.iso.18013.5.1.mDL');

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
      };

      const result = buildDeviceResponse({
        issuerSignedDocuments: [document],
        query,
        deviceJwkPrivateKey,
        sessionTranscript,
        now,
      });

      expect(result.size).toBe(1);
      const mdoc = result.get('credential-1');
      expect(mdoc).toBeDefined();
      expect(mdoc!.get('status')).toBe(MdocStatus.OK);
    });
  });

  describe('error cases', () => {
    it('should throw error when no documents claims are selected', () => {
      const document = buildValidDocument('org.iso.18013.5.1.mDL');

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'credential-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.2.mDL' }, // Different docType
            claims: [
              {
                path: ['org.iso.18013.5.2', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
      };

      expect(() => {
        buildDeviceResponse({
          issuerSignedDocuments: [document],
          query,
          deviceJwkPrivateKey,
          sessionTranscript,
          now,
          clockSkew,
        });
      }).toThrow('No documents claims selected');
    });
  });
});
