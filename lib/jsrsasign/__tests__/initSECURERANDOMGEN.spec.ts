import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KJUR } from 'jsrsasign';
import {
  initSECURERANDOMGEN,
  getSECURERANDOMGEN,
  setSECURERANDOMGEN,
  SECURERANDOMGEN,
} from '../initSECURERANDOMGEN';
import { RandomBytes } from '@/types';

describe('initSECURERANDOMGEN', () => {
  let originalSECURERANDOMGEN: SECURERANDOMGEN | undefined;
  let mockRandomBytes: RandomBytes;

  beforeEach(() => {
    originalSECURERANDOMGEN = getSECURERANDOMGEN();

    mockRandomBytes = vi.fn((length = 32) => {
      const buffer = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        buffer[i] = i % 256;
      }
      return buffer;
    });
  });

  afterEach(() => {
    setSECURERANDOMGEN(originalSECURERANDOMGEN!);
    vi.clearAllMocks();
  });

  it('should set custom PRNG and call randomBytes when getRandomHexOfNbytes is invoked', () => {
    initSECURERANDOMGEN(mockRandomBytes);

    const currentPRNG = getSECURERANDOMGEN()!;
    expect(currentPRNG).toBeDefined();
    expect(currentPRNG.nextBytes).toBeDefined();

    const result = KJUR.crypto.Util.getRandomHexOfNbytes(16);

    expect(mockRandomBytes).toHaveBeenCalledWith(16);
    expect(mockRandomBytes).toHaveBeenCalledTimes(1);

    expect(result).toMatch(/^[0-9a-f]+$/);
    expect(result.length).toBe(32);
  });

  it('should restore original SECURERANDOMGEN after test', () => {
    const originalValue = originalSECURERANDOMGEN;
    initSECURERANDOMGEN(mockRandomBytes);
    expect(getSECURERANDOMGEN()).not.toBe(originalValue);
    setSECURERANDOMGEN(originalValue!);
    expect(getSECURERANDOMGEN()).toBe(originalValue);
  });

  it('should handle different byte lengths correctly', () => {
    initSECURERANDOMGEN(mockRandomBytes);
    const lengths = [8, 16, 32, 64];
    for (const length of lengths) {
      vi.mocked(mockRandomBytes).mockClear();
      const result = KJUR.crypto.Util.getRandomHexOfNbytes(length);
      expect(mockRandomBytes).toHaveBeenCalledWith(length);
      expect(mockRandomBytes).toHaveBeenCalledTimes(1);
      expect(result.length).toBe(length * 2);
    }
  });

  it('should create PRNG with correct nextBytes implementation', () => {
    initSECURERANDOMGEN(mockRandomBytes);
    const prng = getSECURERANDOMGEN()!;
    const testArray = new Array(8);
    prng.nextBytes(testArray);
    expect(mockRandomBytes).toHaveBeenCalledWith(8);
    for (let i = 0; i < 8; i++) {
      expect(testArray[i]).toBe(i % 256);
    }
  });
});
