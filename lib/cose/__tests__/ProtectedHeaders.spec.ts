import { describe, it, expect } from 'vitest';
import { ProtectedHeaders } from '../ProtectedHeaders';
import { Headers, Algorithms } from '../types';
import type { ProtectedHeadersEntries } from '../ProtectedHeaders';

describe('ProtectedHeaders', () => {
  describe('construction', () => {
    it('creates a new ProtectedHeaders instance', () => {
      const headers = new ProtectedHeaders();
      expect(headers).toBeInstanceOf(ProtectedHeaders);
      expect(typeof headers.set).toBe('function');
      expect(typeof headers.get).toBe('function');
      expect(typeof headers.has).toBe('function');
      expect(typeof headers.delete).toBe('function');
    });

    it('creates with various initial entries', () => {
      const keyId = new Uint8Array([0x01, 0x02]);
      const ctBytes = new Uint8Array([1, 2, 3]);

      const entries: ProtectedHeadersEntries = [
        [Headers.Algorithm, Algorithms.ES256],
        [Headers.Critical, [Headers.Algorithm]],
        [Headers.ContentType, 42],
        [Headers.ContentType, ctBytes],
        [Headers.KeyId, keyId],
      ];

      const headers = new ProtectedHeaders(entries);

      expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);
      expect(headers.get(Headers.Critical)).toEqual([Headers.Algorithm]);
      // Last ContentType wins
      expect(headers.get(Headers.ContentType)).toEqual(ctBytes);
      expect(headers.get(Headers.KeyId)).toEqual(keyId);
    });
  });

  describe('set and get: algorithm and critical', () => {
    it('allows setting and getting Algorithm header', () => {
      const headers = new ProtectedHeaders();

      headers.set(Headers.Algorithm, Algorithms.ES256);
      expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);

      headers.set(Headers.Algorithm, Algorithms.ES384);
      expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES384);

      headers.set(Headers.Algorithm, Algorithms.ES512);
      expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES512);
    });

    it('allows setting and getting Critical header', () => {
      const headers = new ProtectedHeaders();
      const criticalHeaders = [Headers.Algorithm, Headers.KeyId];

      headers.set(Headers.Critical, criticalHeaders);
      expect(headers.get(Headers.Critical)).toEqual(criticalHeaders);

      const emptyCritical: Headers[] = [];
      headers.set(Headers.Critical, emptyCritical);
      expect(headers.get(Headers.Critical)).toEqual(emptyCritical);
    });
  });

  describe('set and get: contentType and keyId', () => {
    it('allows setting and getting ContentType header with number', () => {
      const headers = new ProtectedHeaders();
      const contentType = 42;

      headers.set(Headers.ContentType, contentType);
      expect(headers.get(Headers.ContentType)).toBe(contentType);
    });

    it('allows setting and getting ContentType header with Uint8Array', () => {
      const headers = new ProtectedHeaders();
      const contentType = new Uint8Array([1, 2, 3, 4]);

      headers.set(Headers.ContentType, contentType);
      expect(headers.get(Headers.ContentType)).toEqual(contentType);
    });

    it('allows setting and getting KeyID header', () => {
      const headers = new ProtectedHeaders();
      const keyId = new Uint8Array([0x01, 0x02, 0x03, 0x04]);

      headers.set(Headers.KeyId, keyId);
      expect(headers.get(Headers.KeyId)).toEqual(keyId);
    });
  });

  describe('map operations', () => {
    it('supports has method to check if header exists', () => {
      const headers = new ProtectedHeaders();

      expect(headers.has(Headers.Algorithm)).toBe(false);

      headers.set(Headers.Algorithm, Algorithms.ES256);
      expect(headers.has(Headers.Algorithm)).toBe(true);
    });

    it('supports delete method to remove headers', () => {
      const headers = new ProtectedHeaders();

      headers.set(Headers.Algorithm, Algorithms.ES256);
      expect(headers.has(Headers.Algorithm)).toBe(true);

      headers.delete(Headers.Algorithm);
      expect(headers.has(Headers.Algorithm)).toBe(false);
      expect(headers.get(Headers.Algorithm)).toBeUndefined();
    });
  });

  describe('Omit type headers - binary', () => {
    it('works with Omit type headers - Uint8Array values', () => {
      const headers = new ProtectedHeaders();

      // Test headers that are part of the Omit type with Uint8Array values
      headers.set(Headers.IV, new Uint8Array([0x10, 0x20, 0x30]));
      headers.set(Headers.PartialIV, new Uint8Array([0x40, 0x50, 0x60]));
      headers.set(Headers.X5Bag, new Uint8Array([0x70, 0x80, 0x90]));
      headers.set(Headers.X5T, new Uint8Array([0xa0, 0xb0, 0xc0]));
      headers.set(Headers.X5U, new Uint8Array([0xd0, 0xe0, 0xf0]));

      expect(headers.get(Headers.IV)).toEqual(
        new Uint8Array([0x10, 0x20, 0x30])
      );
      expect(headers.get(Headers.PartialIV)).toEqual(
        new Uint8Array([0x40, 0x50, 0x60])
      );
      expect(headers.get(Headers.X5Bag)).toEqual(
        new Uint8Array([0x70, 0x80, 0x90])
      );
      expect(headers.get(Headers.X5T)).toEqual(
        new Uint8Array([0xa0, 0xb0, 0xc0])
      );
      expect(headers.get(Headers.X5U)).toEqual(
        new Uint8Array([0xd0, 0xe0, 0xf0])
      );
    });

    it('supports predefined X5Chain header with Uint8Array array values', () => {
      const headers = new ProtectedHeaders();

      // Test headers that are part of the Omit type with Uint8Array array values
      const x5ChainValue = [
        new Uint8Array([0x01, 0x02]),
        new Uint8Array([0x03, 0x04]),
      ];
      headers.set(Headers.X5Chain, x5ChainValue);

      expect(headers.get(Headers.X5Chain)).toEqual(x5ChainValue);
    });
  });

  describe('Omit type headers - numbers', () => {
    it('works with Omit type headers - number values', () => {
      const headers = new ProtectedHeaders();

      // Test headers that are part of the Omit type with number values
      headers.set(Headers.CounterSignature, 123);
      headers.set(Headers.CounterSignature0, 456);
      headers.set(Headers.CounterSignatureV2, 789);
      headers.set(Headers.CounterSignature0V2, 101112);

      expect(headers.get(Headers.CounterSignature)).toBe(123);
      expect(headers.get(Headers.CounterSignature0)).toBe(456);
      expect(headers.get(Headers.CounterSignatureV2)).toBe(789);
      expect(headers.get(Headers.CounterSignature0V2)).toBe(101112);
    });

    it('works with Omit type headers - number array values', () => {
      const headers = new ProtectedHeaders();

      // Test headers that are part of the Omit type with number array values
      const counterSignatureArray = [100, 200, 300];
      const counterSignature0Array = [400, 500, 600];

      headers.set(Headers.CounterSignature, counterSignatureArray);
      headers.set(Headers.CounterSignature0, counterSignature0Array);

      expect(headers.get(Headers.CounterSignature)).toEqual(
        counterSignatureArray
      );
      expect(headers.get(Headers.CounterSignature0)).toEqual(
        counterSignature0Array
      );
    });
  });
});
