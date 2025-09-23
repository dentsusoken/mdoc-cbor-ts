import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KJUR } from 'jsrsasign';
import {
  initPRNG,
  getSECURERANDOMGEN,
  setSECURERANDOMGEN,
  SECURERANDOMGEN,
} from '../initPRNG';
import { RandomBytes } from '../types';

describe('initPRNG', () => {
  let originalSECURERANDOMGEN: SECURERANDOMGEN | undefined;
  let mockRandomBytes: RandomBytes;

  beforeEach(() => {
    // Store the original SECURERANDOMGEN
    originalSECURERANDOMGEN = getSECURERANDOMGEN();

    // Create a mock randomBytes function
    mockRandomBytes = vi.fn((length = 32) => {
      const buffer = new Uint8Array(length);
      // Fill with predictable values for testing
      for (let i = 0; i < length; i++) {
        buffer[i] = i % 256;
      }
      return buffer;
    });
  });

  afterEach(() => {
    // Restore the original SECURERANDOMGEN
    setSECURERANDOMGEN(originalSECURERANDOMGEN!);
    vi.clearAllMocks();
  });

  it('should set custom PRNG and call randomBytes when getRandomHexOfNbytes is invoked', () => {
    // Initialize PRNG with mock function
    initPRNG(mockRandomBytes);

    // Verify that SECURERANDOMGEN was set
    const currentPRNG = getSECURERANDOMGEN()!;
    expect(currentPRNG).toBeDefined();
    expect(currentPRNG.nextBytes).toBeDefined();

    // Call getRandomHexOfNbytes to trigger the custom PRNG
    const result = KJUR.crypto.Util.getRandomHexOfNbytes(16);

    // Verify that our mock randomBytes was called
    expect(mockRandomBytes).toHaveBeenCalledWith(16);
    expect(mockRandomBytes).toHaveBeenCalledTimes(1);

    // Verify that the result is a hex string of expected length
    expect(result).toMatch(/^[0-9a-f]+$/);
    expect(result.length).toBe(32); // 16 bytes = 32 hex characters
  });

  it('should restore original SECURERANDOMGEN after test', () => {
    // Store the original value before any modifications
    const originalValue = originalSECURERANDOMGEN;

    // Initialize PRNG
    initPRNG(mockRandomBytes);

    // Verify it was changed
    expect(getSECURERANDOMGEN()).not.toBe(originalValue);

    // Restore manually (simulating what afterEach does)
    setSECURERANDOMGEN(originalValue!);

    // Verify it was restored
    expect(getSECURERANDOMGEN()).toBe(originalValue);
  });

  it('should handle different byte lengths correctly', () => {
    initPRNG(mockRandomBytes);

    // Test with different lengths
    const lengths = [8, 16, 32, 64];

    for (const length of lengths) {
      vi.mocked(mockRandomBytes).mockClear();

      const result = KJUR.crypto.Util.getRandomHexOfNbytes(length);

      expect(mockRandomBytes).toHaveBeenCalledWith(length);
      expect(mockRandomBytes).toHaveBeenCalledTimes(1);
      expect(result.length).toBe(length * 2); // Each byte = 2 hex characters
    }
  });

  it('should create PRNG with correct nextBytes implementation', () => {
    initPRNG(mockRandomBytes);

    const prng = getSECURERANDOMGEN()!;

    // Test the nextBytes method directly
    const testArray = new Array(8);
    prng.nextBytes(testArray);

    expect(mockRandomBytes).toHaveBeenCalledWith(8);

    // Verify the array was filled with our mock data
    for (let i = 0; i < 8; i++) {
      expect(testArray[i]).toBe(i % 256);
    }
  });
});
