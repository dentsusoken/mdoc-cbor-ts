import { describe, expect, it, vi } from 'vitest';
import { defaultUnprotectHeaderGenerator } from './UnprotectHeaderGenerator';
import { Headers, UnprotectedHeaders } from '@auth0/cose';
import { X509Generator } from '../../middleware/x509';

describe('UnprotectHeaderGenerator', () => {
  it('should generate unprotected headers correctly', async () => {
    const mockCert = new Uint8Array([1, 2, 3, 4]);
    const mockX509Generator: X509Generator = {
      generate: vi.fn().mockResolvedValue(mockCert),
    };

    const result = await defaultUnprotectHeaderGenerator.generate(
      mockX509Generator
    );

    expect(result).toBeInstanceOf(UnprotectedHeaders);
    expect(result.get(Headers.X5Chain)).toEqual(mockCert);
    expect(mockX509Generator.generate).toHaveBeenCalledWith('der');
  });

  it('should handle certificate generation error', async () => {
    const mockX509Generator: X509Generator = {
      generate: vi
        .fn()
        .mockRejectedValue(new Error('Certificate generation failed')),
    };

    await expect(
      defaultUnprotectHeaderGenerator.generate(mockX509Generator)
    ).rejects.toThrow('Certificate generation failed');
  });
});
