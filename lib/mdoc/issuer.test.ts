import { Algorithms, COSEKey, COSEKeyParam } from '@auth0/cose';
import { MdocCborIssuer } from './issuer';

describe('MdocCborIssuer', async () => {
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
    it('should create an instance of MdocCborIssuer', () => {
      const issuer = new MdocCborIssuer(privateKey);
      expect(issuer).toBeInstanceOf(MdocCborIssuer);
    });
  });
  describe('new', () => {
    it('should create a new mdoc document', async () => {
      const issuer = new MdocCborIssuer(privateKey);
      const mdoc = await issuer.new(data, 'eu.europa.ec.eudiw.pid.1');
      expect(mdoc).hasOwnProperty('version');
      expect(mdoc).hasOwnProperty('status');
      expect(mdoc).hasOwnProperty('documents');
    });
  });
  describe('dump', () => {
    it('should return a CBOR encoded mdoc document', async () => {
      const issuer = new MdocCborIssuer(privateKey);
      const cbor = issuer.dump();
      expect(cbor).toBeInstanceOf(Uint8Array);
    });
  });
  describe('dumps', () => {
    it('should return a CBOR encoded mdoc document as a string', async () => {
      const issuer = new MdocCborIssuer(privateKey);
      const cbor = issuer.dumps();
      expect(typeof cbor === 'string').toBe(true);
    });
  });
});
