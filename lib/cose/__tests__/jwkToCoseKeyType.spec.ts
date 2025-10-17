import { describe, it, expect } from 'vitest';
import { jwkToCoseKeyType } from '../jwkToCoseKeyType';
import { KeyType } from '../types';
import { JwkKeyTypes } from '@/jwk/types';

describe('jwkToCoseKeyType', () => {
  it('should convert EC key type to COSE EC key type', () => {
    const result = jwkToCoseKeyType(JwkKeyTypes.EC);
    expect(result).toBe(KeyType.EC);
  });

  it('should convert OKP key type to COSE OKP key type', () => {
    const result = jwkToCoseKeyType(JwkKeyTypes.OKP);
    expect(result).toBe(KeyType.OKP);
  });

  it('should convert oct key type to COSE oct key type', () => {
    const result = jwkToCoseKeyType(JwkKeyTypes.oct);
    expect(result).toBe(KeyType.oct);
  });

  it('should convert string EC to COSE EC key type', () => {
    const result = jwkToCoseKeyType('EC');
    expect(result).toBe(KeyType.EC);
  });

  it('should convert string OKP to COSE OKP key type', () => {
    const result = jwkToCoseKeyType('OKP');
    expect(result).toBe(KeyType.OKP);
  });

  it('should convert string oct to COSE oct key type', () => {
    const result = jwkToCoseKeyType('oct');
    expect(result).toBe(KeyType.oct);
  });

  it('should throw error for unsupported key type RSA', () => {
    expect(() => {
      jwkToCoseKeyType('RSA');
    }).toThrow('Unsupported JWK key type: RSA');
  });

  it('should throw error for empty string', () => {
    expect(() => {
      jwkToCoseKeyType('');
    }).toThrow('Unsupported JWK key type: ');
  });

  it('should throw error for invalid key type', () => {
    expect(() => {
      jwkToCoseKeyType('invalid');
    }).toThrow('Unsupported JWK key type: invalid');
  });

  it('should throw error for null key type', () => {
    expect(() => {
      jwkToCoseKeyType(null as unknown as string);
    }).toThrow('Unsupported JWK key type: null');
  });

  it('should throw error for undefined key type', () => {
    expect(() => {
      jwkToCoseKeyType(undefined as unknown as string);
    }).toThrow('Unsupported JWK key type: undefined');
  });

  it('should be case sensitive', () => {
    expect(() => {
      jwkToCoseKeyType('ec');
    }).toThrow('Unsupported JWK key type: ec');
  });

  it('should be case sensitive for OKP', () => {
    expect(() => {
      jwkToCoseKeyType('okp');
    }).toThrow('Unsupported JWK key type: okp');
  });
});
