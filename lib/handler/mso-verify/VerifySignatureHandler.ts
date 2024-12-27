import { X509Parser } from '../../middleware/x509';
import { Headers, Sign1 } from '@auth0/cose';

export type VerifySignatureHandler = (mso: Sign1) => Promise<void>;

export const createDefaultVerifySignatureHandler = (
  x509Parser: X509Parser
): VerifySignatureHandler => {
  return async (mso: Sign1) => {
    if (!mso) {
      throw new Error('Invalid mso: Sign1 object is required');
    }

    const mixedHeaders = Object.fromEntries([
      ...(mso.protectedHeaders || []),
      ...(mso.unprotectedHeaders || []),
    ]);

    const x5ChainHeader = mixedHeaders[Headers.X5Chain.toString()];
    if (!x5ChainHeader) {
      throw new Error('X5Chain header not found');
    }

    const certs = Array.isArray(x5ChainHeader)
      ? await Promise.all(x5ChainHeader.map((c) => x509Parser.parse(c)))
      : [await x509Parser.parse(x5ChainHeader as Uint8Array)];

    if (!certs.length) {
      throw new Error('No certificates found in X5Chain');
    }

    const cert = await certs[0];
    if (!cert?.publicKey) {
      throw new Error('Public key not found in certificate');
    }

    const publicKey = await cert.publicKey.export();
    if (!publicKey) {
      throw new Error('Failed to export public key');
    }

    try {
      await mso.verify(publicKey);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Signature verification failed: ${errorMessage}`);
    }
  };
};
