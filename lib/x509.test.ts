import { MsoX509Fabric } from './x509';

describe('MsoX509Fabric', () => {
  describe('selfSignedX509Cert', () => {
    it('should return a self-signed X509 certificate in DER format', () => {
      const x509Fabric = new MsoX509Fabric();
      const cert = x509Fabric.selfSignedX509Cert('DER');
      expect(cert).toBeDefined();
      expect(cert).not.toContain('-----BEGIN CERTIFICATE-----');
      expect(cert).not.toContain('-----END CERTIFICATE-----');
    });

    it('should return a self-signed X509 certificate in PEM format', () => {
      const x509Fabric = new MsoX509Fabric();
      const cert = x509Fabric.selfSignedX509Cert('PEM');
      expect(cert).toBeDefined();
      expect(cert).toContain('-----BEGIN CERTIFICATE-----');
      expect(cert).toContain('-----END CERTIFICATE-----');
    });
  });
});
