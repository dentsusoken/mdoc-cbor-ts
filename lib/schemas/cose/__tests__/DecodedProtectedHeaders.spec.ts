import { describe, expect, it } from 'vitest';
import { Algorithm, Header } from '../../../cose/types';
import {
  createDecodedProtectedHeadersBuilder,
  decodedProtectedHeadersSchema,
} from '../DecodedProtectedHeaders';

describe('decodedProtectedHeadersSchema', () => {
  describe('valid inputs', () => {
    it('should parse valid Algorithm header with ES256', () => {
      const input = new Map([[Header.Algorithm, Algorithm.ES256]]);
      const result = decodedProtectedHeadersSchema.parse(input);
      result.get(Header.ContentType);

      expect(result.size).toBe(1);
      expect(result.get(Header.Algorithm)).toBe(Algorithm.ES256);
    });

    it('should parse valid Algorithm header with EdDSA', () => {
      const input = new Map([[Header.Algorithm, Algorithm.EdDSA]]);
      const result = decodedProtectedHeadersSchema.parse(input);

      expect(result.size).toBe(1);
      expect(result.get(Header.Algorithm)).toBe(Algorithm.EdDSA);
    });

    it('should parse valid Algorithm header with ES384', () => {
      const input = new Map([[Header.Algorithm, Algorithm.ES384]]);
      const result = decodedProtectedHeadersSchema.parse(input);

      expect(result.size).toBe(1);
      expect(result.get(Header.Algorithm)).toBe(Algorithm.ES384);
    });

    it('should parse valid Algorithm header with ES512', () => {
      const input = new Map([[Header.Algorithm, Algorithm.ES512]]);
      const result = decodedProtectedHeadersSchema.parse(input);

      expect(result.size).toBe(1);
      expect(result.get(Header.Algorithm)).toBe(Algorithm.ES512);
    });
  });

  describe('passthrough mode - unknown keys', () => {
    it('should preserve unknown headers in passthrough mode', () => {
      const input = new Map<Header, Algorithm | string | Uint8Array>([
        [Header.Algorithm, Algorithm.ES256],
        [Header.KeyId, 'key-123'],
        [Header.IV, new Uint8Array([1, 2, 3])],
      ]);

      const result = decodedProtectedHeadersSchema.parse(input);

      expect(result.size).toBe(3);
      expect(result.get(Header.Algorithm)).toBe(Algorithm.ES256);
      expect(result.get(Header.KeyId)).toBe('key-123');
      expect(result.get(Header.IV)).toEqual(new Uint8Array([1, 2, 3]));
    });

    it('should preserve multiple unknown headers', () => {
      const input = new Map<Header, Algorithm | string | number[]>([
        [Header.Algorithm, Algorithm.EdDSA],
        [Header.KeyId, 'kid-value'],
        [Header.ContentType, 'application/json'],
        [Header.Critical, [1, 4]],
      ]);

      const result = decodedProtectedHeadersSchema.parse(input);

      expect(result.size).toBe(4);
      expect(result.get(Header.Algorithm)).toBe(Algorithm.EdDSA);
      expect(result.get(Header.KeyId)).toBe('kid-value');
      expect(result.get(Header.ContentType)).toBe('application/json');
      expect(result.get(Header.Critical)).toEqual([1, 4]);
    });
  });

  describe('invalid inputs', () => {
    it('should reject invalid algorithm value', () => {
      const input = new Map([[Header.Algorithm, 999]]);

      expect(() => decodedProtectedHeadersSchema.parse(input)).toThrow();
    });

    it('should reject non-numeric algorithm value', () => {
      const input = new Map([[Header.Algorithm, 'ES256']]);

      expect(() => decodedProtectedHeadersSchema.parse(input)).toThrow();
    });

    it('should provide custom error message with target prefix', () => {
      const input = new Map([[Header.Algorithm, 123]]);

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
      const input = { [Header.Algorithm]: Algorithm.ES256 };

      expect(() => decodedProtectedHeadersSchema.parse(input)).toThrow();
    });
  });

  describe('optional Algorithm header', () => {
    it('should reject when Algorithm header is missing', () => {
      const input = new Map([[Header.KeyId, 'key-123']]);

      expect(() => decodedProtectedHeadersSchema.parse(input)).toThrow();
    });
  });
});

describe('createDecodedProtectedHeadersBuilder', () => {
  describe('known keys', () => {
    it('should allow setting Algorithm header with ES256', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Header.Algorithm, Algorithm.ES256)
        .build();

      expect(builder.size).toBe(1);
      expect(builder.get(Header.Algorithm)).toBe(Algorithm.ES256);
    });

    it('should allow setting Algorithm header with EdDSA', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Header.Algorithm, Algorithm.EdDSA)
        .build();

      expect(builder.size).toBe(1);
      expect(builder.get(Header.Algorithm)).toBe(Algorithm.EdDSA);
    });

    it('should allow overwriting Algorithm header', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Header.Algorithm, Algorithm.ES256)
        .set(Header.Algorithm, Algorithm.EdDSA)
        .build();

      expect(builder.size).toBe(1);
      expect(builder.get(Header.Algorithm)).toBe(Algorithm.EdDSA);
    });
  });

  describe('unknown keys with setUnknown', () => {
    it('should allow setting unknown Headers.KeyId', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Header.Algorithm, Algorithm.ES256)
        .setUnknown(Header.KeyId, 'key-123')
        .build();

      expect(builder.size).toBe(2);
      expect(builder.get(Header.Algorithm)).toBe(Algorithm.ES256);
      expect(builder.get(Header.KeyId)).toBe('key-123');
    });

    it('should allow setting unknown Headers.IV', () => {
      const iv = new Uint8Array([1, 2, 3, 4]);
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Header.Algorithm, Algorithm.EdDSA)
        .setUnknown(Header.IV, iv)
        .build();

      expect(builder.size).toBe(2);
      expect(builder.get(Header.Algorithm)).toBe(Algorithm.EdDSA);
      expect(builder.get(Header.IV)).toBe(iv);
    });

    it('should allow setting multiple unknown headers', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Header.Algorithm, Algorithm.ES384)
        .setUnknown(Header.KeyId, 'kid-value')
        .setUnknown(Header.ContentType, 'application/cbor')
        .setUnknown(Header.Critical, [1, 4])
        .build();

      expect(builder.size).toBe(4);
      expect(builder.get(Header.Algorithm)).toBe(Algorithm.ES384);
      expect(builder.get(Header.KeyId)).toBe('kid-value');
      expect(builder.get(Header.ContentType)).toBe('application/cbor');
      expect(builder.get(Header.Critical)).toEqual([1, 4]);
    });

    it('should allow overwriting unknown headers', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Header.Algorithm, Algorithm.ES256)
        .setUnknown(Header.KeyId, 'initial')
        .setUnknown(Header.KeyId, 'updated')
        .build();

      expect(builder.size).toBe(2);
      expect(builder.get(Header.KeyId)).toBe('updated');
    });
  });

  describe('method chaining', () => {
    it('should support fluent interface with mixed keys', () => {
      const builder = createDecodedProtectedHeadersBuilder()
        .set(Header.Algorithm, Algorithm.ES512)
        .setUnknown(Header.KeyId, 'key-abc')
        .setUnknown(Header.IV, new Uint8Array([5, 6, 7]))
        .set(Header.Algorithm, Algorithm.ES256) // Overwrite
        .build();

      expect(builder.size).toBe(3);
      expect(builder.get(Header.Algorithm)).toBe(Algorithm.ES256);
      expect(builder.get(Header.KeyId)).toBe('key-abc');
      expect(builder.get(Header.IV)).toEqual(new Uint8Array([5, 6, 7]));
    });
  });

  describe('schema validation with builder output', () => {
    it('should validate builder output with schema', () => {
      const headers = createDecodedProtectedHeadersBuilder()
        .set(Header.Algorithm, Algorithm.ES256)
        .setUnknown(Header.KeyId, 'test-key')
        .build();

      const result = decodedProtectedHeadersSchema.parse(headers);

      expect(result.size).toBe(2);
      expect(result.get(Header.Algorithm)).toBe(Algorithm.ES256);
      expect(result.get(Header.KeyId)).toBe('test-key');
    });

    it('should reject invalid algorithm from builder when validated', () => {
      const headers = createDecodedProtectedHeadersBuilder()
        .setUnknown(Header.Algorithm, 999) // Invalid algorithm via setUnknown
        .build();

      expect(() => decodedProtectedHeadersSchema.parse(headers)).toThrow();
    });
  });
});
