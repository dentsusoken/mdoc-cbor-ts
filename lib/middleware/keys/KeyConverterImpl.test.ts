import { describe, expect, it } from 'vitest';
import { defaultConvertToCoseKey } from './ConvertToCoseKey';
import { defaultConvertToCryptoKey } from './ConvertToCryptoKey';
import { defaultConvertToJWK } from './ConvertToJWK';
import { KeyConverterImpl } from './KeyConverterImpl';

describe('KeyConverterImpl', () => {
  it('should use default converters when no options provided', () => {
    const converter = new KeyConverterImpl({});
    expect(converter.convertToCoseKey).toBe(defaultConvertToCoseKey);
    expect(converter.convertToCryptoKey).toBe(defaultConvertToCryptoKey);
    expect(converter.convertToJWK).toBe(defaultConvertToJWK);
  });

  it('should use custom convertToCoseKey when provided', () => {
    const customConverter = async () => {
      return {} as any;
    };
    const converter = new KeyConverterImpl({
      convertToCoseKey: customConverter,
    });
    expect(converter.convertToCoseKey).toBe(customConverter);
    expect(converter.convertToCryptoKey).toBe(defaultConvertToCryptoKey);
    expect(converter.convertToJWK).toBe(defaultConvertToJWK);
  });

  it('should use custom convertToCryptoKey when provided', () => {
    const customConverter = async () => {
      return {} as any;
    };
    const converter = new KeyConverterImpl({
      convertToCryptoKey: customConverter,
    });
    expect(converter.convertToCoseKey).toBe(defaultConvertToCoseKey);
    expect(converter.convertToCryptoKey).toBe(customConverter);
    expect(converter.convertToJWK).toBe(defaultConvertToJWK);
  });

  it('should use custom convertToJWK when provided', () => {
    const customConverter = async () => {
      return {} as any;
    };
    const converter = new KeyConverterImpl({ convertToJWK: customConverter });
    expect(converter.convertToCoseKey).toBe(defaultConvertToCoseKey);
    expect(converter.convertToCryptoKey).toBe(defaultConvertToCryptoKey);
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

    const converter = new KeyConverterImpl({
      convertToCoseKey: customCoseConverter,
      convertToCryptoKey: customCryptoConverter,
      convertToJWK: customJWKConverter,
    });

    expect(converter.convertToCoseKey).toBe(customCoseConverter);
    expect(converter.convertToCryptoKey).toBe(customCryptoConverter);
    expect(converter.convertToJWK).toBe(customJWKConverter);
  });
});
