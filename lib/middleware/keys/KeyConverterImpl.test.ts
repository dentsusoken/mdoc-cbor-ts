import { describe, expect, it } from 'vitest';
import { KeyConverterConfig, KeyConverterImpl } from './KeyConverterImpl';

describe('KeyConverterImpl', () => {
  const config: KeyConverterConfig = {
    KEY_ALGORITHM: 'ES256',
    NAMED_CURVE: 'P-256',
    HASH_ALGORITHM: 'SHA-256',
  };

  it('should use default converters when no options provided', () => {
    const converter = new KeyConverterImpl(config, {});

    expect(converter.convertToCoseKey).toBeDefined();
    expect(converter.convertToCryptoKey).toBeDefined();
    expect(converter.convertToJWK).toBeDefined();
  });

  it('should use custom convertToCoseKey when provided', () => {
    const customConverter = async () => {
      return {} as any;
    };
    const converter = new KeyConverterImpl(config, {
      convertToCoseKey: customConverter,
    });

    expect(converter.convertToCoseKey).toBe(customConverter);
    expect(converter.convertToCryptoKey).toBeDefined();
    expect(converter.convertToJWK).toBeDefined();
  });

  it('should use custom convertToCryptoKey when provided', () => {
    const customConverter = async () => {
      return {} as any;
    };
    const converter = new KeyConverterImpl(config, {
      convertToCryptoKey: customConverter,
    });

    expect(converter.convertToCoseKey).toBeDefined();
    expect(converter.convertToCryptoKey).toBe(customConverter);
    expect(converter.convertToJWK).toBeDefined();
  });

  it('should use custom convertToJWK when provided', () => {
    const customConverter = async () => {
      return {} as any;
    };
    const converter = new KeyConverterImpl(config, {
      convertToJWK: customConverter,
    });

    expect(converter.convertToCoseKey).toBeDefined();
    expect(converter.convertToCryptoKey).toBeDefined();
    expect(converter.convertToJWK).toBe(customConverter);
  });

  it('should use all custom converters when provided', () => {
    const customCoseConverter = async () => {
      return {} as any;
    };
    const customCryptoConverter = async () => {
      return {} as any;
    };
    const customJWKConverter = async () => {
      return {} as any;
    };

    const converter = new KeyConverterImpl(config, {
      convertToCoseKey: customCoseConverter,
      convertToCryptoKey: customCryptoConverter,
      convertToJWK: customJWKConverter,
    });

    expect(converter.convertToCoseKey).toBe(customCoseConverter);
    expect(converter.convertToCryptoKey).toBe(customCryptoConverter);
    expect(converter.convertToJWK).toBe(customJWKConverter);
  });
});
