import {
  Algorithms,
  Headers,
  ProtectedHeaders,
  UnprotectedHeaders,
} from '@auth0/cose';
import { importX509, KeyLike } from 'jose';
import { X509Certificate } from 'node:crypto';
import { IssuerAuth } from '../../../schemas/mso';
import { lookupAlgorithm } from '../../../utils/lookupAlgorithm';

export type ExtractPublicKey = (issuerAuth: IssuerAuth) => Promise<KeyLike>;

export const extractPublicKey: ExtractPublicKey = async (issuerAuth) => {
  const protectedHeaders = ProtectedHeaders.from(
    issuerAuth.protectedHeaders.entries() as Iterable<
      [Headers.Algorithm, Algorithms]
    >
  );
  const unprotectedHeaders = UnprotectedHeaders.from(
    issuerAuth.unprotectedHeaders.entries() as Iterable<
      [Headers.Algorithm, Algorithms]
    >
  );

  // TODO: 多分ヘッダーを結合したほうがいい気がする。
  const x5c =
    protectedHeaders.get(Headers.X5Chain) ??
    unprotectedHeaders.get(Headers.X5Chain);

  const alg = lookupAlgorithm(
    protectedHeaders.get(Headers.Algorithm) ??
      unprotectedHeaders.get(Headers.Algorithm)
  );

  if (!x5c) {
    throw new Error('X509 certificate not found');
  }
  const certs: X509Certificate[] = [];
  if (Array.isArray(x5c)) {
    x5c.forEach((cert) => {
      certs.push(new X509Certificate(cert));
    });
  } else {
    certs.push(new X509Certificate(x5c));
  }

  const pem = certs[0].toString();
  return await importX509(pem, alg);
};
