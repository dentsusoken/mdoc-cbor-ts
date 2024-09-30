import { Algorithms, COSEKey, COSEKeyParam } from '@auth0/cose';
import { MsoIssuer } from './issuer';
import { MsoVerifier } from './verifier';

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
  const msoIssuer = new MsoIssuer(data, privateKey);
  const mso = (await msoIssuer.sign()).encode();

  describe('constructor', () => {
    it('should create an instance of MsoIssuer', async () => {
      const msoVerifier = new MsoVerifier(mso);
      expect(msoVerifier).toBeInstanceOf(MsoVerifier);
    });
  });
  describe('rowPublicKeys', () => {
    it('should return the public key', async () => {
      const msoVerifier = new MsoVerifier(mso);
      const iter = msoVerifier.rowPublicKeys();
      expect(iter).toHaveProperty('next');
      expect(iter.next()).toHaveProperty('value');
    });
  });
  describe('loadPublicKey', () => {
    it('should load the public key', async () => {
      const msoVerifier = new MsoVerifier(mso);
      await msoVerifier.loadPublicKey();
      expect(msoVerifier.publicKey).toBeInstanceOf(COSEKey);
    });
  });
  describe('verifySignature', () => {
    it('should load the public key', async () => {
      const msoVerifier = new MsoVerifier(mso);
      expect(await msoVerifier.verifySignature()).toBe(true);
    });
  });
});
