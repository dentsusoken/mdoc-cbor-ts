import { describe, it, expect } from 'vitest';
import { Document } from './Document';
import { MsoIssuer } from '../mso/issuer';
import { Algorithms, COSEKey, COSEKeyParam } from '@auth0/cose';
import { Settings } from '../settings';

const MICOV_DATA = {
  'org.micov.medical.1': {
    last_name: 'Rossi',
    given_name: 'Mario',
    birth_date: '1922-03-13',
    PersonId_nic: {
      PersonIdNumber: '1234567890',
      PersonIdType: 'nic',
      PersonIdIS: 'IT',
    },
    sex: 1,
    'VPInfo_COVID-19_1': {
      VaccineProphylaxis: '',
      VaccMedicinalProd: 'Moderna',
      VaccMktAuthHolder: 'Moderna',
      VaccDoseNumber: '2/2',
      VaccAdmDate: '2021-01-01',
      VaccCountry: 'IT',
    },
    CertIssuer: 'Italian Ministry of Health',
    CertId: '1234567890',
  },
};

describe('Document', () => {
  describe('new', () => {
    it('should create a new Document instance', async () => {
      const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);

      const msoi = await MsoIssuer.new(MICOV_DATA, privateKey, new Settings());
      const document = await Document.new('testType', msoi);

      expect(document).toBeInstanceOf(Document);
      expect(document.docType).toBe('testType');
    });
  });

  describe('toJSON', () => {
    it('should return a JSON representation of the document', async () => {
      const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);

      const msoi = await MsoIssuer.new(MICOV_DATA, privateKey, new Settings());
      const document = await Document.new('testType', msoi);
      const json = document.toJSON();

      expect(json).toEqual({
        docType: 'testType',
        issuerSigned: document.issuerSigned,
      });
    });
    it('should return a JSON representation of the document without docType', async () => {
      const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);

      const msoi = await MsoIssuer.new(MICOV_DATA, privateKey, new Settings());
      const document = await Document.new(undefined, msoi);
      const json = document.toJSON();

      expect(json).toEqual({
        issuerSigned: document.issuerSigned.toJSON(),
      });
    });
  });

  describe('encode', () => {
    it('should encode the document to CBOR', async () => {
      const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);

      const msoi = await MsoIssuer.new(MICOV_DATA, privateKey, new Settings());
      const document = await Document.new(undefined, msoi);
      const encoded = document.encode();

      expect(encoded).toBeInstanceOf(Uint8Array);
    });
  });

  describe('fromJSON', () => {
    it('should create a Document instance from JSON', () => {
      const json = {
        docType: 'testType',
        issuerSigned: { nameSpaces: {}, issuerAuth: new Uint8Array() },
      };
      const document = Document.fromJSON(json);

      expect(document).toBeInstanceOf(Document);
      expect(document.docType).toBe('testType');
    });
  });
});
