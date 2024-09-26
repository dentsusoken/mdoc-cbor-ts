import { Algorithms, COSEKey } from '@auth0/cose';
import { MsoX509Fabric } from './x509';

describe('MsoX509Fabric', async () => {
  const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
    crv: 'P-256',
  });
  describe('selfSignedX509Cert', () => {
    it('should return a self-signed X509 certificate in DER format', async () => {
      const x509Fabric = new MsoX509Fabric(privateKey);
      const cert = await x509Fabric.selfSignedX509Cert('DER');
      expect(cert).toBeDefined();
      expect(cert).not.toContain('-----BEGIN CERTIFICATE-----');
      expect(cert).not.toContain('-----END CERTIFICATE-----');
    });

    it('should return a self-signed X509 certificate in PEM format', async () => {
      const x509Fabric = new MsoX509Fabric(privateKey);
      const cert = await x509Fabric.selfSignedX509Cert('PEM');
      console.log('cert :>> ', cert);
      expect(cert).toBeDefined();
      expect(cert).toContain('-----BEGIN CERTIFICATE-----');
      expect(cert).toContain('-----END CERTIFICATE-----');
    });
  });
});
