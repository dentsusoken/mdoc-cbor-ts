import { describe, it, expect, vi } from 'vitest';
import { verifyIssuerSignedDocuments } from '../verifyIssuerSignedDocuments';
import * as verifyIssuerSignedModule from '../../mso/verifyIssuerSigned';
import { buildMobileSecurityObject } from '@/handlers/issue/mso/buildMobileSecurityObject';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { Header, Algorithm } from '@/cose/types';
import { encodeCbor } from '@/cbor/codec';
import { createTag18 } from '@/cbor/createTag18';
import { Sign1 } from '@/cose/Sign1';
import { createSelfSignedCertificate } from '@/x509/createSelfSignedCertificate';
import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
import { MdocErrorCode } from '@/mdoc/types';
import { IssuerSigned, createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { Tag } from 'cbor-x';
import { Document, createDocument } from '@/schemas/mdoc/Document';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';

const buildNameSpaces = (): IssuerNameSpaces => {
  const item = createIssuerSignedItem([
    ['digestID', 1],
    ['random', new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])],
    ['elementIdentifier', 'given_name'],
    ['elementValue', 'Alice'],
  ]);
  const tag = createTag24(item);
  const map: Map<string, Tag[]> = new Map([['org.iso.18013.5.1', [tag]]]);
  return map;
};

const p256 = createSignatureCurve('P-256', randomBytes);

const buildValidIssuerSigned = (docType: string): IssuerSigned => {
  const nameSpaces = buildNameSpaces();

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

describe('verifyIssuerSignedDocuments', () => {
  const now = new Date();
  const clockSkew = 60;

  describe('success cases', () => {
    it('should verify a single valid document', () => {
      const document = buildValidDocument('org.iso.18013.5.1.mDL');

      const result = verifyIssuerSignedDocuments({
        issuerSignedDocuments: [document],
        now,
        clockSkew,
      });

      expect(result.documents).toHaveLength(1);
      expect(result.documents[0]).toBe(document);
      expect(result.documentErrors).toHaveLength(0);
    });

    it('should verify multiple valid documents', () => {
      const document1 = buildValidDocument('org.iso.18013.5.1.mDL');
      const document2 = buildValidDocument('org.iso.18013.5.2.mDL');

      const result = verifyIssuerSignedDocuments({
        issuerSignedDocuments: [document1, document2],
        now,
        clockSkew,
      });

      expect(result.documents).toHaveLength(2);
      expect(result.documents).toContain(document1);
      expect(result.documents).toContain(document2);
      expect(result.documentErrors).toHaveLength(0);
    });

    it('should use default now when not provided', () => {
      const document = buildValidDocument('org.iso.18013.5.1.mDL');

      const result = verifyIssuerSignedDocuments({
        issuerSignedDocuments: [document],
        clockSkew,
      });

      expect(result.documents).toHaveLength(1);
      expect(result.documentErrors).toHaveLength(0);
    });

    it('should use default clockSkew when not provided', () => {
      const document = buildValidDocument('org.iso.18013.5.1.mDL');

      const result = verifyIssuerSignedDocuments({
        issuerSignedDocuments: [document],
        now,
      });

      expect(result.documents).toHaveLength(1);
      expect(result.documentErrors).toHaveLength(0);
    });
  });

  describe('error cases', () => {
    it('should handle a document that fails verification with ErrorCodeError', () => {
      const document = buildValidDocument('org.iso.18013.5.1.mDL');

      // Mock verifyIssuerSigned to throw an ErrorCodeError
      vi.spyOn(
        verifyIssuerSignedModule,
        'verifyIssuerSigned'
      ).mockImplementationOnce(() => {
        throw new ErrorCodeError(
          'IssuerAuth is invalid',
          MdocErrorCode.IssuerAuthInvalid
        );
      });

      const result = verifyIssuerSignedDocuments({
        issuerSignedDocuments: [document],
        now,
        clockSkew,
      });

      expect(result.documents).toHaveLength(0);
      expect(result.documentErrors).toHaveLength(1);
      expect(result.documentErrors[0].get('org.iso.18013.5.1.mDL')).toBe(
        MdocErrorCode.IssuerAuthInvalid
      );
    });

    it('should handle a document that fails verification with generic error', () => {
      const document = buildValidDocument('org.iso.18013.5.1.mDL');

      // Mock verifyIssuerSigned to throw a generic error
      vi.spyOn(
        verifyIssuerSignedModule,
        'verifyIssuerSigned'
      ).mockImplementationOnce(() => {
        throw new Error('Generic error');
      });

      const result = verifyIssuerSignedDocuments({
        issuerSignedDocuments: [document],
        now,
        clockSkew,
      });

      expect(result.documents).toHaveLength(0);
      expect(result.documentErrors).toHaveLength(1);
      expect(result.documentErrors[0].get('org.iso.18013.5.1.mDL')).toBe(
        MdocErrorCode.IssuerSignedVerificationFailed
      );
    });

    it('should handle partial success with some documents passing and some failing', () => {
      const validDocument1 = buildValidDocument('org.iso.18013.5.1.mDL');
      const validDocument2 = buildValidDocument('org.iso.18013.5.2.mDL');
      const invalidDocument = buildValidDocument('org.iso.18013.5.3.mDL');

      // Mock verifyIssuerSigned to fail for the third document
      const verifySpy = vi.spyOn(
        verifyIssuerSignedModule,
        'verifyIssuerSigned'
      );
      verifySpy
        .mockImplementationOnce(() => {
          // First call succeeds - return a valid result
          return { mso: new Map(), nameSpaces: buildNameSpaces() };
        })
        .mockImplementationOnce(() => {
          // Second call succeeds - return a valid result
          return { mso: new Map(), nameSpaces: buildNameSpaces() };
        })
        .mockImplementationOnce(() => {
          // Third call fails
          throw new ErrorCodeError(
            'Value digests are missing',
            MdocErrorCode.ValueDigestsMissing
          );
        });

      const result = verifyIssuerSignedDocuments({
        issuerSignedDocuments: [
          validDocument1,
          validDocument2,
          invalidDocument,
        ],
        now,
        clockSkew,
      });

      expect(result.documents).toHaveLength(2);
      expect(result.documents).toContain(validDocument1);
      expect(result.documents).toContain(validDocument2);
      expect(result.documentErrors).toHaveLength(1);
      expect(result.documentErrors[0].get('org.iso.18013.5.3.mDL')).toBe(
        MdocErrorCode.ValueDigestsMissing
      );
    });

    it('should handle multiple documents with different error codes', () => {
      const document1 = buildValidDocument('org.iso.18013.5.1.mDL');
      const document2 = buildValidDocument('org.iso.18013.5.2.mDL');

      const verifySpy = vi.spyOn(
        verifyIssuerSignedModule,
        'verifyIssuerSigned'
      );
      verifySpy
        .mockImplementationOnce(() => {
          throw new ErrorCodeError(
            'IssuerAuth is invalid',
            MdocErrorCode.IssuerAuthInvalid
          );
        })
        .mockImplementationOnce(() => {
          throw new ErrorCodeError(
            'Document has expired',
            MdocErrorCode.DocumentExpired
          );
        });

      const result = verifyIssuerSignedDocuments({
        issuerSignedDocuments: [document1, document2],
        now,
        clockSkew,
      });

      expect(result.documents).toHaveLength(0);
      expect(result.documentErrors).toHaveLength(2);
      expect(result.documentErrors[0].get('org.iso.18013.5.1.mDL')).toBe(
        MdocErrorCode.IssuerAuthInvalid
      );
      expect(result.documentErrors[1].get('org.iso.18013.5.2.mDL')).toBe(
        MdocErrorCode.DocumentExpired
      );
    });

    it('should handle empty array of documents', () => {
      const result = verifyIssuerSignedDocuments({
        issuerSignedDocuments: [],
        now,
        clockSkew,
      });

      expect(result.documents).toHaveLength(0);
      expect(result.documentErrors).toHaveLength(0);
    });
  });
});
