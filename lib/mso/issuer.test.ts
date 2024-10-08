import { Algorithms, COSEKey, COSEKeyParam, Sign1 } from '@auth0/cose';
import { MsoIssuer } from './issuer';

describe('MsoIssuer', async () => {
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
  describe('constructor', () => {
    it('should create an instance of MsoIssuer', async () => {
      const msoIssuer = await MsoIssuer.new(data, privateKey);
      expect(msoIssuer).toBeInstanceOf(MsoIssuer);
    });
  });
  describe('constructor', () => {
    it('should create an instance of MsoIssuer', async () => {
      const msoIssuer = await MsoIssuer.new(data, privateKey);
      const sig = await msoIssuer.sign();
      expect(sig).toBeInstanceOf(Sign1);
    });
  });
});
