import { describe, expect, it } from 'vitest';
import { Algorithms, Headers } from '../../../cose/types';
import {
  createDecodedProtectedHeadersBuilder,
  decodedProtectedHeadersSchema,
} from '../DecodedProtectedHeaders';

describe('decodedProtectedHeadersSchema', () => {
  describe('valid inputs', () => {
    it('should parse valid Algorithm header with ES256', () => {
      const input = new Map([[Headers.Algorithm, Algorithms.ES256]]);
      const result = decodedProtectedHeadersSchema.parse(input);
      result.get(Headers.ContentType);

      expect(result.size).toBe(1);
      expect(result.get(Headers.Algorithm)).toBe(Algorithms.ES256);
    });

    it('should parse valid Algorithm header with EdDSA', () => {
      const input = new Map([[Headers.Algorithm, Algorithms.EdDSA]]);
      const result = decodedProtectedHeadersSchema.parse(input);

      expect(result.size).toBe(1);
      expect(result.get(Headers.Algorithm)).toBe(Algorithms.EdDSA);
    });

    it('should parse valid Algorithm header with ES384', () => {
      const input = new Map([[Headers.Algorithm, Algorithms.ES384]]);
      const result = decodedProtectedHeadersSchema.parse(input);

      expect(result.size).toBe(1);
      expect(result.get(Headers.Algorithm)).toBe(Algorithms.ES384);
    });

    it('should parse valid Algorithm header with ES512', () => {
      const input = new Map([[Headers.Algorithm, Algorithms.ES512]]);
      const result = decodedProtectedHeadersSchema.parse(input);

      expect(result.size).toBe(1);
      expect(result.get(Headers.Algorithm)).toBe(Algorithms.ES512);
    });
  });

  describe('passthrough mode - unknown keys', () => {
    it('should preserve unknown headers in passthrough mode', () => {
      const input = new Map<Headers, Algorithms | string | Uint8Array>([
        [Headers.Algorithm, Algorithms.ES256],
        [Headers.KeyId, 'key-123'],
        [Headers.IV, new Uint8Array([1, 2, 3])],
      ]);

      const result = decodedProtectedHeadersSchema.parse(input);

      expect(result.size).toBe(3);
      expect(result.get(Headers.Algorithm)).toBe(Algorithms.ES256);
      expect(result.get(Headers.KeyId)).toBe('key-123');
      expect(result.get(Headers.IV)).toEqual(new Uint8Array([1, 2, 3]));
    });

    it('should preserve multiple unknown headers', () => {
      const input = new Map<Headers, Algorithms | string | number[]>([
        [Headers.Algorithm, Algorithms.EdDSA],
        [Headers.KeyId, 'kid-value'],
        [Headers.ContentType, 'application/json'],
        [Headers.Critical, [1, 4]],
      ]);

      const result = decodedProtectedHeadersSchema.parse(input);

      expect(result.size).toBe(4);
      expect(result.get(Headers.Algorithm)).toBe(Algorithms.EdDSA);
      expect(result.get(Headers.KeyId)).toBe('kid-value');
      expect(result.get(Headers.ContentType)).toBe('application/json');
      expect(result.get(Headers.Critical)).toEqual([1, 4]);
    });
  });

  describe('invalid inputs', () => {
    it('should reject invalid algorithm value', () => {
      const input = new Map([[Headers.Algorithm, 999]]);

      expect(() => decodedProtectedHeadersSchema.parse(input)).toThrow();
    });

    it('should reject non-numeric algorithm value', () => {
      const input = new Map([[Headers.Algorithm, 'ES256']]);

      expect(() => decodedProtectedHeadersSchema.parse(input)).toThrow();
    });

    it('should provide custom error message with target prefix', () => {
      const input = new Map([[Headers.Algorithm, 123]]);

      try {
        decodedProtectedHeadersSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('alg:');
        expect(errorMessage).toContain('Invalid algorithm');
      }
    });

    it('should reject non-Map input', () => {
      const input = { [Headers.Algorithm]: Algorithms.ES256 };

      expect(() => decodedProtectedHeadersSchema.parse(input)).toThrow();
    });
  });

  describe('optional Algorithm header', () => {
    it('should reject when Algorithm header is missing', () => {
      const input = new Map([[Headers.KeyId, 'key-123']]);

      expect(() => decodedProtectedHeadersSchema.parse(input)).toThrow();
    });
  });
});

describe('createDecodedProtectedHeadersBuilder', () => {
  describe('known keys', () => {
    it('should allow setting Algorithm header with ES256', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Headers.Algorithm, Algorithms.ES256)
        .build();

      expect(builder.size).toBe(1);
      expect(builder.get(Headers.Algorithm)).toBe(Algorithms.ES256);
    });

    it('should allow setting Algorithm header with EdDSA', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Headers.Algorithm, Algorithms.EdDSA)
        .build();

      expect(builder.size).toBe(1);
      expect(builder.get(Headers.Algorithm)).toBe(Algorithms.EdDSA);
    });

    it('should allow overwriting Algorithm header', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Headers.Algorithm, Algorithms.ES256)
        .set(Headers.Algorithm, Algorithms.EdDSA)
        .build();

      expect(builder.size).toBe(1);
      expect(builder.get(Headers.Algorithm)).toBe(Algorithms.EdDSA);
    });
  });

  describe('unknown keys with setUnknown', () => {
    it('should allow setting unknown Headers.KeyId', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Headers.Algorithm, Algorithms.ES256)
        .setUnknown(Headers.KeyId, 'key-123')
        .build();

      expect(builder.size).toBe(2);
      expect(builder.get(Headers.Algorithm)).toBe(Algorithms.ES256);
      expect(builder.get(Headers.KeyId)).toBe('key-123');
    });

    it('should allow setting unknown Headers.IV', () => {
      const iv = new Uint8Array([1, 2, 3, 4]);
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Headers.Algorithm, Algorithms.EdDSA)
        .setUnknown(Headers.IV, iv)
        .build();

      expect(builder.size).toBe(2);
      expect(builder.get(Headers.Algorithm)).toBe(Algorithms.EdDSA);
      expect(builder.get(Headers.IV)).toBe(iv);
    });

    it('should allow setting multiple unknown headers', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Headers.Algorithm, Algorithms.ES384)
        .setUnknown(Headers.KeyId, 'kid-value')
        .setUnknown(Headers.ContentType, 'application/cbor')
        .setUnknown(Headers.Critical, [1, 4])
        .build();

      expect(builder.size).toBe(4);
      expect(builder.get(Headers.Algorithm)).toBe(Algorithms.ES384);
      expect(builder.get(Headers.KeyId)).toBe('kid-value');
      expect(builder.get(Headers.ContentType)).toBe('application/cbor');
      expect(builder.get(Headers.Critical)).toEqual([1, 4]);
    });

    it('should allow overwriting unknown headers', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Headers.Algorithm, Algorithms.ES256)
        .setUnknown(Headers.KeyId, 'initial')
        .setUnknown(Headers.KeyId, 'updated')
        .build();

      expect(builder.size).toBe(2);
      expect(builder.get(Headers.KeyId)).toBe('updated');
    });
  });

  describe('method chaining', () => {
    it('should support fluent interface with mixed keys', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Headers.Algorithm, Algorithms.ES512)
        .setUnknown(Headers.KeyId, 'key-abc')
        .setUnknown(Headers.IV, new Uint8Array([5, 6, 7]))
        .set(Headers.Algorithm, Algorithms.ES256) // Overwrite
        .build();

      expect(builder.size).toBe(3);
      expect(builder.get(Headers.Algorithm)).toBe(Algorithms.ES256);
      expect(builder.get(Headers.KeyId)).toBe('key-abc');
      expect(builder.get(Headers.IV)).toEqual(new Uint8Array([5, 6, 7]));
    });
  });

  describe('schema validation with builder output', () => {
    it('should validate builder output with schema', () => {
      const headers = createDecodedProtectedHeadersBuilder()
        .set(Headers.Algorithm, Algorithms.ES256)
        .setUnknown(Headers.KeyId, 'test-key')
        .build();

      const result = decodedProtectedHeadersSchema.parse(headers);

      expect(result.size).toBe(2);
      expect(result.get(Headers.Algorithm)).toBe(Algorithms.ES256);
      expect(result.get(Headers.KeyId)).toBe('test-key');
    });

    it('should reject invalid algorithm from builder when validated', () => {
      const headers = createDecodedProtectedHeadersBuilder()
        .setUnknown(Headers.Algorithm, 999) // Invalid algorithm via setUnknown
        .build();

      expect(() => decodedProtectedHeadersSchema.parse(headers)).toThrow();
    });
  });
});
