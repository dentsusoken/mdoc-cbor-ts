import { Algorithms, COSEKey, COSEKeyParam } from '@auth0/cose';
import { MsoIssuer } from '../mso/issuer';
import { IssuerSigned } from './issuersigned';

describe('IssuerSigned', async () => {
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
  const msoIssuer = await MsoIssuer.create(data, privateKey);
  const mso = await msoIssuer.sign();

  describe('constructor', () => {
    it('should create an instance of IssuerSigned with Uint8Array issuerAuth', async () => {
      const issuerSigned = new IssuerSigned(data, mso.encode());
      expect(issuerSigned).toBeInstanceOf(IssuerSigned);
    });
    it('should create an instance of IssuerSigned with dict issuerAuth', async () => {
      const { protectedHeaders, unprotectedHeaders, payload, signature } = mso;
      const issuerSigned = new IssuerSigned(data, {
        protectedHeaders,
        unprotectedHeaders,
        payload,
        signature,
      });
      expect(issuerSigned).toBeInstanceOf(IssuerSigned);
    });
  });
});
