import { describe, it } from 'vitest';
// ProtectedHeaders and UnprotectedHeaders classes do not exist here; use Map-based headers
import { Headers, Algorithms } from '../types';
import { Sign1 as OurSign1 } from '../Sign1';
import { encodeCbor, decodeCbor } from '@/cbor/codec';
import { createSelfSignedCertificate } from '@/x509/createSelfSignedCertificate';
import { certificateToDerBytes } from '@/x509/certificateToDerBytes';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import {
  Sign1 as Auth0Sign1,
  Headers as Auth0Headers,
  UnprotectedHeaders as Auth0UnprotectedHeaders,
  ProtectedHeaders as Auth0ProtectedHeaders,
} from '@auth0/cose';

const p256 = createSignatureCurve('P-256', randomBytes);

describe('Sign1 interop with @auth0/cose', () => {
  it('signs with our Sign1 and verifies with @auth0/cose', async () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const cert = createSelfSignedCertificate({
      subjectJwkPublicKey: jwkPublicKey,
      caJwkPrivateKey: jwkPrivateKey,
      subject: 'Sign1 Interop',
      serialHex: '01',
    });
    const der = certificateToDerBytes(cert);

    const ph = new Map<number, unknown>([
      [Headers.Algorithm, Algorithms.ES256],
    ]);
    const uh = new Map<number, unknown>([[Headers.X5Chain, [der]]]);
    const payload = new Uint8Array([1, 2, 3, 4]);

    const ours = OurSign1.sign({
      protectedHeaders: encodeCbor(ph),
      unprotectedHeaders: uh,
      payload,
      jwkPrivateKey,
    });

    const encoded = encodeCbor(ours.getContentForEncoding());

    const decodedAuth0 = Auth0Sign1.decode(encoded);
    const cryptoPublicKey = await crypto.subtle.importKey(
      'jwk',
      jwkPublicKey,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['verify']
    );
    await decodedAuth0.verify(cryptoPublicKey);
  });

  it('signs with @auth0/cose and verifies with our Sign1', async () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const cert = createSelfSignedCertificate({
      subjectJwkPublicKey: jwkPublicKey,
      caJwkPrivateKey: jwkPrivateKey,
      subject: 'Sign1 Interop',
      serialHex: '02',
    });
    const der = certificateToDerBytes(cert);

    const ph = new Auth0ProtectedHeaders([
      [Headers.Algorithm, Algorithms.ES256],
    ]);
    const uh = new Auth0UnprotectedHeaders();
    uh.set(Auth0Headers.X5Chain, [der]);
    const payload = new Uint8Array([9, 8, 7]);
    const ctyptoPrivateKey = await crypto.subtle.importKey(
      'jwk',
      jwkPrivateKey,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['sign']
    );

    const auth0 = await Auth0Sign1.sign(ph, uh, payload, ctyptoPrivateKey);
    const encoded = auth0.encode();
    const auth0Sign1 = decodeCbor(encoded) as Auth0Sign1;
    const contentForEncoding = auth0Sign1.getContentForEncoding();

    const ours = new OurSign1(
      contentForEncoding[0] as Uint8Array,
      contentForEncoding[1] as Map<number, unknown>,
      contentForEncoding[2] as Uint8Array,
      contentForEncoding[3] as Uint8Array
    );

    ours.verify();
  });

  it('signs and verifies using externalAad with our Sign1', async () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const cert = createSelfSignedCertificate({
      subjectJwkPublicKey: jwkPublicKey,
      caJwkPrivateKey: jwkPrivateKey,
      subject: 'Sign1 externalAad',
      serialHex: '03',
    });
    const der = certificateToDerBytes(cert);

    const ph = new Map<number, unknown>([
      [Headers.Algorithm, Algorithms.ES256],
    ]);
    const uh = new Map<number, unknown>([[Headers.X5Chain, [der]]]);
    const payload = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const externalAad = new Uint8Array([0xaa, 0xbb]);

    const ours = OurSign1.sign({
      protectedHeaders: encodeCbor(ph),
      unprotectedHeaders: uh,
      externalAad,
      payload,
      jwkPrivateKey,
    });

    // Verify must use the same externalAad
    ours.verify({ externalAad });
  });

  it('signs with detached payload and verifies by providing detachedPayload', async () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const cert = createSelfSignedCertificate({
      subjectJwkPublicKey: jwkPublicKey,
      caJwkPrivateKey: jwkPrivateKey,
      subject: 'Sign1 detached',
      serialHex: '04',
    });
    const der = certificateToDerBytes(cert);

    const ph = new Map<number, unknown>([
      [Headers.Algorithm, Algorithms.ES256],
    ]);
    const uh = new Map<number, unknown>([[Headers.X5Chain, [der]]]);
    const detachedPayload = new Uint8Array([1, 1, 2, 3, 5, 8]);

    const ours = OurSign1.sign({
      protectedHeaders: encodeCbor(ph),
      unprotectedHeaders: uh,
      payload: null,
      detachedPayload,
      jwkPrivateKey,
    });

    // Must supply detachedPayload at verify time since payload was null
    ours.verify({ detachedPayload });
  });
});
