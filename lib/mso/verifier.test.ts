import { Algorithms, COSEKey, COSEKeyParam } from '@auth0/cose';
import { MsoIssuer } from './issuer';
import { MSOVerifier } from './verifier';
import * as x509 from '@peculiar/x509';

describe('MsoVerifier', async () => {
  const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
    crv: 'P-256',
  });
  privateKey.set(COSEKeyParam.Algorithm, Algorithms.ES256);
  const data = {
    'eu.europa.ec.eudiw.pid.1': {
      family_name: 'Raffaello',
      given_name: 'Mascetti',
      birth_date: '1922-03-13',
      birth_place: 'Rome',
      birth_country: 'IT',
    },
    'eu.europa.ec.eudiw.pid.it.1': {
      tax_id_code: 'TINIT-XXXXXXXXXXXXXXX',
    },
  };
  const msoIssuer = await MsoIssuer.new(data, privateKey);
  const mso = (await msoIssuer.sign()).encode();

  describe('constructor', () => {
    it('should create an instance of MsoIssuer', async () => {
      const msoVerifier = new MSOVerifier(mso);
      expect(msoVerifier).toBeInstanceOf(MSOVerifier);
    });
  });
  describe('rowPublicKeys', () => {
    it('should return the public key', async () => {
      const msoVerifier = new MSOVerifier(mso);
      const certs = msoVerifier.rawPublicKeys();
      expect(certs[0]).toBeInstanceOf(x509.X509Certificate);
    });
  });
  describe('loadPublicKey', () => {
    it('should load the public key', async () => {
      const msoVerifier = new MSOVerifier(mso);
      await msoVerifier.loadPublicKey();
      expect(msoVerifier.publicKey).toBeInstanceOf(CryptoKey);
    });
  });
  describe('verifySignature', () => {
    it('should load the public key', async () => {
      const msoVerifier = new MSOVerifier(mso);
      expect(await msoVerifier.verify()).toBe(true);
    });
  });
});
