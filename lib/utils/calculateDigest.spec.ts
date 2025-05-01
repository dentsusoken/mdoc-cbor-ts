import crypto from 'crypto';
import { describe, expect, it, vi } from 'vitest';
import { ByteString } from '../cbor';
import { calculateDigest } from './calculateDigest';

const mockDigest = new Uint8Array([1, 2, 3, 4, 5]);

// Mock the crypto module
vi.mock('crypto', () => ({
  default: {
    subtle: {
      digest: vi.fn(),
    },
  },
}));

describe('calculateDigest', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(crypto.subtle.digest).mockResolvedValue(mockDigest);
  });

  it('should calculate digest using SHA-256', async () => {
    const testData = new ByteString({
      digestID: 0,
      elementIdentifier: 'test-element',
      elementValue: 'test-value',
      random: Buffer.from('test-random'),
    });

    const result = await calculateDigest('SHA-256', testData);
    expect(result).toEqual(Buffer.from(mockDigest));
    expect(crypto.subtle.digest).toHaveBeenCalledWith(
      'SHA-256',
      expect.any(Uint8Array)
    );
  });

  it('should handle different digest algorithms', async () => {
    const testData = new ByteString({
      digestID: 0,
      elementIdentifier: 'test-element',
      elementValue: 'test-value',
      random: Buffer.from('test-random'),
    });

    const result = await calculateDigest('SHA-384', testData);
    expect(result).toEqual(Buffer.from(mockDigest));
    expect(crypto.subtle.digest).toHaveBeenCalledWith(
      'SHA-384',
      expect.any(Uint8Array)
    );
  });
});
