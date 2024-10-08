import { describe, it, expect } from 'vitest';
import { IssuerSigned } from './IssuerSigned';
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

describe('IssuerSigned', () => {
  describe('new', () => {
    it('should create a new IssuerSigned instance', async () => {
      const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);

      const msoi = await MsoIssuer.new(MICOV_DATA, privateKey, new Settings());
      const issuerSigned = await IssuerSigned.new(msoi);

      expect(issuerSigned).toBeInstanceOf(IssuerSigned);
    });
  });

  describe('toJSON', () => {
    it('should return a JSON representation of the issuer signed', async () => {
      const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);

      const msoi = await MsoIssuer.new(MICOV_DATA, privateKey, new Settings());
      const issuerSigned = await IssuerSigned.new(msoi);
      const json = issuerSigned.toJSON();

      expect(json).toEqual({
        nameSpaces: issuerSigned.nameSpaces,
        issuerAuth: issuerSigned.issuerAuth,
      });
    });
  });

  describe('fromJSON', () => {
    it('should create an IssuerSigned instance from JSON', () => {
      const json = { nameSpaces: {}, issuerAuth: new Uint8Array() };
      const issuerSigned = IssuerSigned.fromJSON(json);

      expect(issuerSigned).toBeInstanceOf(IssuerSigned);
    });
  });
});
