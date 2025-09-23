import { UnprotectedHeaders } from './UnprotectedHeaders';
import { ProtectedHeaders } from './ProtectedHeaders';
import { decodeCbor, encodeCbor } from '@/cbor/codec';
import { Algorithms } from './types';
import { JwkPublicKey } from 'noble-curves-extended';
import { Headers } from '@/cose/types';
import { derBytesToX509 } from '@/x509/derBytesToX509';

export type VerifyOptions = {
  externalAAD?: Uint8Array;
  detachedPayload?: Uint8Array;
  algorithms?: Algorithms[];
};

export class SignBase {
  public readonly protectedHeaders: ProtectedHeaders;
  public readonly unprotectedHeaders: UnprotectedHeaders;
  public readonly encodedProtectedHeaders: Uint8Array;
  public readonly signature: Uint8Array;

  constructor(
    protectedHeaders: ProtectedHeaders | Uint8Array,
    unprotectedHeaders: UnprotectedHeaders,
    signature: Uint8Array
  ) {
    if (protectedHeaders instanceof ProtectedHeaders) {
      this.protectedHeaders = protectedHeaders;
      this.encodedProtectedHeaders = encodeCbor(protectedHeaders);
    } else {
      this.encodedProtectedHeaders = protectedHeaders;
      this.protectedHeaders = decodeCbor(protectedHeaders) as ProtectedHeaders;
    }
    this.unprotectedHeaders = unprotectedHeaders;
    this.signature = signature;
  }

  get x5c(): Uint8Array[] {
    const x5c =
      this.protectedHeaders.get(Headers.X5Chain) ??
      this.unprotectedHeaders.get(Headers.X5Chain);

    if (!x5c || x5c.length === 0) {
      throw new Error('X509 certificate not found');
    }

    return x5c;
  }

  async verifyX509Chain(): Promise<{
    publicKey: JwkPublicKey;
    raw: Uint8Array;
  }> {
    const { x5c } = this;

    const certificates = x5c.map((c) => derBytesToX509(c));
    const verified = certificates.map((c) =>
      c.verifySignature(c.getPublicKey())
    );

    const chainEngine = new pkijs.CertificateChainValidationEngine({
      certs: x5chain.map((c) => pkijs.Certificate.fromBER(c)),
      trustedCerts: x5c.map((c) =>
        pkijs.Certificate.fromBER(decodeBase64(pemToCert(c)))
      ),
    });

    const chain = await chainEngine.verify();

    if (!chain.result) {
      throw new X509InvalidCertificateChain(chain.resultMessage);
    }

    const x509Cert = certToPEM(x5chain[0]);

    const publicKey = await importX509(x509Cert, this.algName as string);

    return { publicKey, raw: x5chain[0] };
  }
}
