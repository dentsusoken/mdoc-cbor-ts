import { Algorithms, COSEKey, COSEKeyParam } from '@auth0/cose';
import { MdocCborIssuer } from './issuer';
import { MdocCbor } from './verifier';

describe('MdocCbor', async () => {
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
  const issuer = new MdocCborIssuer(privateKey);
  await issuer.new(data, 'eu.europa.ec.eudiw.pid.1');

  describe('load', () => {
    it('should load the data', async () => {
      const mdoc = new MdocCbor();
      mdoc.load(issuer.dump());
    });
  });
  describe('loads', () => {
    it('should create an instance of MobileDocument with dict issuerAuth', async () => {
      const mdoc = new MdocCbor();
      mdoc.loadHex(issuer.dumps());
    });
  });
  describe('verify', () => {
    it('should create an instance of MobileDocument with dict issuerAuth', async () => {
      const mdoc = new MdocCbor();
      mdoc.loadHex(issuer.dumps());

      const result = await mdoc.verify();
      expect(result).toBe(true);
    });
  });
});
