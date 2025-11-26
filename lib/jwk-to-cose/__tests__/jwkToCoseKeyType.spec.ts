import { describe, it, expect } from 'vitest';
import { jwkToCoseKeyType } from '../jwkToCoseKeyType';
import { KeyType } from '../../cose/types';
import { JwkKeyType } from '@/jwk/types';

describe('jwkToCoseKeyType', () => {
  it('should convert EC key type to COSE EC key type', () => {
    const result = jwkToCoseKeyType(JwkKeyType.EC);
    expect(result).toBe(KeyType.EC);
  });

  it('should convert OKP key type to COSE OKP key type', () => {
    const result = jwkToCoseKeyType(JwkKeyType.OKP);
    expect(result).toBe(KeyType.OKP);
  });

  it('should convert oct key type to COSE oct key type', () => {
    const result = jwkToCoseKeyType(JwkKeyType.oct);
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

  it('should return number type', () => {
    const result = jwkToCoseKeyType(JwkKeyType.EC);
    expect(typeof result).toBe('number');
    expect(result).toBe(KeyType.EC);
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

  it('for non-string inputs', () => {
    expect(() => jwkToCoseKeyType(null as unknown)).toThrow(
      'Unsupported JWK key type: null'
    );
    expect(() => jwkToCoseKeyType(undefined as unknown)).toThrow(
      'Unsupported JWK key type: undefined'
    );
    expect(() => jwkToCoseKeyType(123 as unknown)).toThrow(
      'Unsupported JWK key type: 123'
    );
    expect(() => jwkToCoseKeyType({} as unknown)).toThrow(
      'Unsupported JWK key type: [object Object]'
    );
    expect(() => jwkToCoseKeyType([] as unknown)).toThrow(
      'Unsupported JWK key type: '
    );
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
