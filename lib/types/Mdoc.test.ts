import { describe, it, expect } from 'vitest';
import { Mdoc } from './Mdoc';
import { Document } from './Document';
import { Algorithms, COSEKey, COSEKeyParam } from '@auth0/cose';
import { IssuerSigned } from './IssuerSigned';
import { encode } from 'cbor-x';

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

describe('Mdoc', () => {
  describe('new', () => {
    it('should create a new Mdoc instance', async () => {
      const data = [{ docType: 'testType', data: {} }];
      const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);
      const mdoc = await Mdoc.new('1.0', data, 200, privateKey);

      expect(mdoc).toBeInstanceOf(Mdoc);
    });
  });

  describe('toJSON', () => {
    it('should return a JSON representation of the Mdoc', async () => {
      const data = [{ docType: 'testType', data: {} }];
      const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);
      const mdoc = await Mdoc.new('1.0', data, 200, privateKey);
      const json = mdoc.toJSON();

      expect(json).toEqual({
        version: '1.0',
        documents: mdoc.documents.map((doc) => doc.toJSON()),
        status: 200,
      });
    });
  });

  describe('decode', () => {
    it('should decode a CBOR string to an Mdoc instance', async () => {
      const data = [{ docType: 'testType', data: {} }];
      const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);
      const cbor = encode(
        (await Mdoc.new('1.0', data, 200, privateKey)).toJSON()
      ).toString('hex');
      const mdoc = Mdoc.decode(cbor);

      expect(mdoc).toBeInstanceOf(Mdoc);
    });
    it('should decode a CBOR bytes to an Mdoc instance', async () => {
      const data = [{ docType: 'testType', data: {} }];
      const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);
      const cbor = encode(
        (await Mdoc.new('1.0', data, 200, privateKey)).toJSON()
      );
      const mdoc = Mdoc.decode(cbor.toString('hex'));

      expect(mdoc).toBeInstanceOf(Mdoc);
    });
  });
});
