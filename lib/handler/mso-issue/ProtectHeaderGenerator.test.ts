import { describe, expect, it } from 'vitest';
import { defaultProtectHeaderGenerator } from './ProtectHeaderGenerator';
import { COSEKey, COSEKeyParam, Headers, ProtectedHeaders } from '@auth0/cose';

describe('ProtectHeaderGenerator', () => {
  it('should generate protected headers correctly', () => {
    const mockAlgorithm = -7; // ES256
    const mockKeyId = new Uint8Array([1, 2, 3, 4]);
    const mockPrivateKey = new COSEKey();
    mockPrivateKey.set(COSEKeyParam.Algorithm, mockAlgorithm);
    mockPrivateKey.set(COSEKeyParam.KeyID, mockKeyId);

    const result = defaultProtectHeaderGenerator.generate(mockPrivateKey);

    expect(result).toBeInstanceOf(ProtectedHeaders);
    expect(result.get(Headers.Algorithm)).toBe(mockAlgorithm);
    expect(result.get(Headers.KeyID)).toEqual(mockKeyId);
  });

  it('should handle missing algorithm', () => {
    const mockKeyId = new Uint8Array([1, 2, 3, 4]);
    const mockPrivateKey = new COSEKey();
    mockPrivateKey.set(COSEKeyParam.KeyID, mockKeyId);

    expect(() =>
      defaultProtectHeaderGenerator.generate(mockPrivateKey)
    ).toThrow('Algorithm is required');
  });

  it('should handle missing key id', () => {
    const mockAlgorithm = -7; // ES256
    const mockPrivateKey = new COSEKey();
    mockPrivateKey.set(COSEKeyParam.Algorithm, mockAlgorithm);

    expect(() =>
      defaultProtectHeaderGenerator.generate(mockPrivateKey)
    ).toThrow('KeyID is required');
  });

  it('should handle missing both algorithm and key id', () => {
    const mockPrivateKey = new COSEKey();

    expect(() =>
      defaultProtectHeaderGenerator.generate(mockPrivateKey)
    ).toThrow('Algorithm is required');
  });
});
