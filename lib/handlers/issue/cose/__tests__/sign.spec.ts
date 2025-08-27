import { Algorithms, COSEKey, Sign1 } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { encode } from 'cbor-x';
import { buildProtectedHeaders } from '@/handlers/issue/cose';

describe('Sign1.sign', () => {
  it('should sign with CBOR-encoded payload and verify', async () => {
    const { privateKey, publicKey } = await COSEKey.generate(Algorithms.ES256, {
      crv: 'P-256',
    });

    const protectedHeaders = buildProtectedHeaders(privateKey);
    const unprotectedHeaders = undefined;
    const payload = encode({ hello: 'world' });

    const sign1 = await Sign1.sign(
      protectedHeaders,
      unprotectedHeaders,
      payload,
      await privateKey.toKeyLike()
    );

    expect(sign1).toBeInstanceOf(Sign1);
    await expect(
      sign1.verify(await publicKey.toKeyLike())
    ).resolves.toBeUndefined();
  });

  it('should sign with null payload (detached) and verify', async () => {
    const { privateKey, publicKey } = await COSEKey.generate(Algorithms.ES256, {
      crv: 'P-256',
    });

    const protectedHeaders = buildProtectedHeaders(privateKey);
    const unprotectedHeaders = undefined;

    const sign1 = await Sign1.sign(
      protectedHeaders,
      unprotectedHeaders,
      null!,
      await privateKey.toKeyLike()
    );

    expect(sign1).toBeInstanceOf(Sign1);
    await expect(
      sign1.verify(await publicKey.toKeyLike())
    ).resolves.toBeUndefined();
  });

  it('should sign with undefined payload and verify', async () => {
    const { privateKey, publicKey } = await COSEKey.generate(Algorithms.ES256, {
      crv: 'P-256',
    });

    const protectedHeaders = buildProtectedHeaders(privateKey);
    const unprotectedHeaders = undefined;

    const sign1 = await Sign1.sign(
      protectedHeaders,
      unprotectedHeaders,
      undefined!,
      await privateKey.toKeyLike()
    );

    expect(sign1).toBeInstanceOf(Sign1);
    await expect(
      sign1.verify(await publicKey.toKeyLike())
    ).resolves.toBeUndefined();
  });
});
