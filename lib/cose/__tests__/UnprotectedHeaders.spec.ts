import { describe, it, expect } from 'vitest';
import {
  UnprotectedHeaders,
  UnprotectedHeadersEntries,
} from '../UnprotectedHeaders';
import { Headers } from '../types';

describe('UnprotectedHeaders', () => {
  describe('construction', () => {
    it('creates a new UnprotectedHeaders instance', () => {
      const headers = new UnprotectedHeaders();
      expect(headers).toBeInstanceOf(UnprotectedHeaders);
      expect(typeof headers.set).toBe('function');
      expect(typeof headers.get).toBe('function');
      expect(typeof headers.has).toBe('function');
      expect(typeof headers.delete).toBe('function');
    });

    it('creates a new UnprotectedHeaders with initial entries', () => {
      const headers = new UnprotectedHeaders([
        [Headers.ContentType, 42],
        [Headers.KeyID, new Uint8Array([0x01, 0x02, 0x03])],
        [Headers.IV, new Uint8Array([0x10, 0x20, 0x30])],
      ]);

      expect(headers.get(Headers.ContentType)).toBe(42);
      expect(headers.get(Headers.KeyID)).toEqual(
        new Uint8Array([0x01, 0x02, 0x03])
      );
      expect(headers.get(Headers.IV)).toEqual(
        new Uint8Array([0x10, 0x20, 0x30])
      );
    });

    it('creates a new UnprotectedHeaders with no entries', () => {
      const headers = new UnprotectedHeaders();

      expect(headers).toBeDefined();
      expect(headers.get(Headers.ContentType)).toBeUndefined();
      expect(headers.get(Headers.KeyID)).toBeUndefined();
      expect(headers.get(Headers.IV)).toBeUndefined();
    });

    it('creates a new UnprotectedHeaders with undefined entries', () => {
      const headers = new UnprotectedHeaders(undefined);

      expect(headers).toBeDefined();
      expect(headers.get(Headers.ContentType)).toBeUndefined();
      expect(headers.get(Headers.KeyID)).toBeUndefined();
      expect(headers.get(Headers.IV)).toBeUndefined();
    });
  });

  describe('initial entries variations', () => {
    it('creates a new UnprotectedHeaders with mixed value types in initial entries', () => {
      const initialEntries: UnprotectedHeadersEntries = [
        [Headers.ContentType, new Uint8Array([0x01, 0x02])], // Uint8Array
        [Headers.KeyID, new Uint8Array([0x03, 0x04, 0x05])], // Uint8Array
        [Headers.X5Chain, [new Uint8Array([0x06, 0x07])]], // Uint8Array array
        [Headers.Algorithm, 123], // Number
        [Headers.Critical, [456, 789]], // Number array
      ];

      const headers = new UnprotectedHeaders(initialEntries);

      expect(headers).toBeDefined();
      expect(headers.get(Headers.ContentType)).toEqual(
        new Uint8Array([0x01, 0x02])
      );
      expect(headers.get(Headers.KeyID)).toEqual(
        new Uint8Array([0x03, 0x04, 0x05])
      );
      expect(headers.get(Headers.X5Chain)).toEqual([
        new Uint8Array([0x06, 0x07]),
      ]);
      expect(headers.get(Headers.Algorithm)).toBe(123);
      expect(headers.get(Headers.Critical)).toEqual([456, 789]);
    });

    it('creates a new UnprotectedHeaders with X5Chain array in initial entries', () => {
      const x5ChainArray = [
        new Uint8Array([0x01, 0x02]),
        new Uint8Array([0x03, 0x04]),
        new Uint8Array([0x05, 0x06]),
      ];

      const initialEntries: UnprotectedHeadersEntries = [
        [Headers.X5Chain, x5ChainArray],
        [Headers.ContentType, 50],
      ];

      const headers = new UnprotectedHeaders(initialEntries);

      expect(headers).toBeDefined();
      expect(headers.get(Headers.X5Chain)).toEqual(x5ChainArray);
      expect(headers.get(Headers.ContentType)).toBe(50);
    });

    it('allows modification of headers created with initial entries', () => {
      const initialEntries: UnprotectedHeadersEntries = [
        [Headers.ContentType, 42],
        [Headers.KeyID, new Uint8Array([0x01, 0x02])],
      ];

      const headers = new UnprotectedHeaders(initialEntries);

      // Verify initial values
      expect(headers.get(Headers.ContentType)).toBe(42);
      expect(headers.get(Headers.KeyID)).toEqual(new Uint8Array([0x01, 0x02]));

      // Modify existing header
      headers.set(Headers.ContentType, 100);
      expect(headers.get(Headers.ContentType)).toBe(100);

      // Add new header
      headers.set(Headers.IV, new Uint8Array([0x10, 0x20]));
      expect(headers.get(Headers.IV)).toEqual(new Uint8Array([0x10, 0x20]));

      // Delete header
      headers.delete(Headers.KeyID);
      expect(headers.get(Headers.KeyID)).toBeUndefined();
    });
  });

  describe('set and get: basic', () => {
    it('allows setting and getting ContentType header with number', () => {
      const headers = new UnprotectedHeaders();
      const contentType = 42;

      headers.set(Headers.ContentType, contentType);
      expect(headers.get(Headers.ContentType)).toBe(contentType);
    });

    it('allows setting and getting ContentType header with Uint8Array', () => {
      const headers = new UnprotectedHeaders();
      const contentType = new Uint8Array([1, 2, 3, 4]);

      headers.set(Headers.ContentType, contentType);
      expect(headers.get(Headers.ContentType)).toEqual(contentType);
    });

    it('allows setting and getting KeyID header', () => {
      const headers = new UnprotectedHeaders();
      const keyId = new Uint8Array([0x01, 0x02, 0x03, 0x04]);

      headers.set(Headers.KeyID, keyId);
      expect(headers.get(Headers.KeyID)).toEqual(keyId);
    });
  });

  describe('map operations', () => {
    it('supports has method to check if header exists', () => {
      const headers = new UnprotectedHeaders();

      expect(headers.has(Headers.ContentType)).toBe(false);

      headers.set(Headers.ContentType, 42);
      expect(headers.has(Headers.ContentType)).toBe(true);
    });

    it('supports delete method to remove headers', () => {
      const headers = new UnprotectedHeaders();

      headers.set(Headers.ContentType, 42);
      expect(headers.has(Headers.ContentType)).toBe(true);

      headers.delete(Headers.ContentType);
      expect(headers.has(Headers.ContentType)).toBe(false);
      expect(headers.get(Headers.ContentType)).toBeUndefined();
    });
  });

  describe('Exclude type headers - binary', () => {
    it('works with Exclude type headers - Uint8Array values', () => {
      const headers = new UnprotectedHeaders();

      // Test headers that are part of the Exclude type with Uint8Array values
      headers.set(Headers.Algorithm, new Uint8Array([0x10, 0x20, 0x30]));
      headers.set(Headers.Critical, new Uint8Array([0x40, 0x50, 0x60]));
      headers.set(Headers.CounterSignature, new Uint8Array([0x70, 0x80, 0x90]));
      headers.set(
        Headers.CounterSignature0,
        new Uint8Array([0xa0, 0xb0, 0xc0])
      );
      headers.set(
        Headers.CounterSignatureV2,
        new Uint8Array([0xd0, 0xe0, 0xf0])
      );
      headers.set(
        Headers.CounterSignature0V2,
        new Uint8Array([0x01, 0x02, 0x03])
      );
      headers.set(Headers.X5Bag, new Uint8Array([0x04, 0x05, 0x06]));
      headers.set(Headers.X5T, new Uint8Array([0x07, 0x08, 0x09]));
      headers.set(Headers.X5U, new Uint8Array([0x0a, 0x0b, 0x0c]));

      expect(headers.get(Headers.Algorithm)).toEqual(
        new Uint8Array([0x10, 0x20, 0x30])
      );
      expect(headers.get(Headers.Critical)).toEqual(
        new Uint8Array([0x40, 0x50, 0x60])
      );
      expect(headers.get(Headers.CounterSignature)).toEqual(
        new Uint8Array([0x70, 0x80, 0x90])
      );
      expect(headers.get(Headers.CounterSignature0)).toEqual(
        new Uint8Array([0xa0, 0xb0, 0xc0])
      );
      expect(headers.get(Headers.CounterSignatureV2)).toEqual(
        new Uint8Array([0xd0, 0xe0, 0xf0])
      );
      expect(headers.get(Headers.CounterSignature0V2)).toEqual(
        new Uint8Array([0x01, 0x02, 0x03])
      );
      expect(headers.get(Headers.X5Bag)).toEqual(
        new Uint8Array([0x04, 0x05, 0x06])
      );
      expect(headers.get(Headers.X5T)).toEqual(
        new Uint8Array([0x07, 0x08, 0x09])
      );
      expect(headers.get(Headers.X5U)).toEqual(
        new Uint8Array([0x0a, 0x0b, 0x0c])
      );
    });

    it('works with Exclude type headers - Uint8Array array values', () => {
      const headers = new UnprotectedHeaders();

      // Test headers that are part of the Exclude type with Uint8Array array values
      const algorithmArray = [
        new Uint8Array([0x01, 0x02]),
        new Uint8Array([0x03, 0x04]),
      ];
      const criticalArray = [
        new Uint8Array([0x05, 0x06]),
        new Uint8Array([0x07, 0x08]),
      ];

      headers.set(Headers.Algorithm, algorithmArray);
      headers.set(Headers.Critical, criticalArray);

      expect(headers.get(Headers.Algorithm)).toEqual(algorithmArray);
      expect(headers.get(Headers.Critical)).toEqual(criticalArray);
    });
  });

  describe('Exclude type headers - numbers', () => {
    it('works with Exclude type headers - number values', () => {
      const headers = new UnprotectedHeaders();

      // Test headers that are part of the Exclude type with number values
      headers.set(Headers.Algorithm, 123);
      headers.set(Headers.Critical, 456);
      headers.set(Headers.CounterSignature, 789);
      headers.set(Headers.CounterSignature0, 101112);
      headers.set(Headers.CounterSignatureV2, 131415);
      headers.set(Headers.CounterSignature0V2, 161718);
      headers.set(Headers.X5Bag, 192021);
      headers.set(Headers.X5T, 222324);
      headers.set(Headers.X5U, 252627);

      expect(headers.get(Headers.Algorithm)).toBe(123);
      expect(headers.get(Headers.Critical)).toBe(456);
      expect(headers.get(Headers.CounterSignature)).toBe(789);
      expect(headers.get(Headers.CounterSignature0)).toBe(101112);
      expect(headers.get(Headers.CounterSignatureV2)).toBe(131415);
      expect(headers.get(Headers.CounterSignature0V2)).toBe(161718);
      expect(headers.get(Headers.X5Bag)).toBe(192021);
      expect(headers.get(Headers.X5T)).toBe(222324);
      expect(headers.get(Headers.X5U)).toBe(252627);
    });

    it('works with Exclude type headers - number array values', () => {
      const headers = new UnprotectedHeaders();

      // Test headers that are part of the Exclude type with number array values
      const algorithmArray = [100, 200, 300];
      const criticalArray = [400, 500, 600];
      const counterSignatureArray = [700, 800, 900];

      headers.set(Headers.Algorithm, algorithmArray);
      headers.set(Headers.Critical, criticalArray);
      headers.set(Headers.CounterSignature, counterSignatureArray);

      expect(headers.get(Headers.Algorithm)).toEqual(algorithmArray);
      expect(headers.get(Headers.Critical)).toEqual(criticalArray);
      expect(headers.get(Headers.CounterSignature)).toEqual(
        counterSignatureArray
      );
    });
  });
});
