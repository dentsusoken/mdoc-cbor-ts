import { Algorithms, COSEKey } from '@auth0/cose';
import { Settings } from './settings';
import { MsoX509Fabric } from './x509.bak';

describe('x509', async () => {
  const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
    crv: 'P-256',
  });
  describe('selfsignedX509Cert', () => {
    it('should return a DER encoded certificate', async () => {
      const fabric = new MsoX509Fabric(privateKey, new Settings());
      const cert = await fabric.selfsignedX509Cert('DER');
      expect(cert).toBeDefined();
    });
  });
});
