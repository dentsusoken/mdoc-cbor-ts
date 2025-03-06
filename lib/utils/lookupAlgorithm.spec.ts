import { Algorithms } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { lookupAlgorithm } from './lookupAlgorithm';

describe('lookupAlgorithm', () => {
  it('should return correct algorithm name for EdDSA', () => {
    expect(lookupAlgorithm(Algorithms.EdDSA)).toBe('EdDSA');
  });

  it('should return correct algorithm name for ES256', () => {
    expect(lookupAlgorithm(Algorithms.ES256)).toBe('ES256');
  });

  it('should return correct algorithm name for ES384', () => {
    expect(lookupAlgorithm(Algorithms.ES384)).toBe('ES384');
  });

  it('should return correct algorithm name for ES512', () => {
    expect(lookupAlgorithm(Algorithms.ES512)).toBe('ES512');
  });

  it('should return correct algorithm name for PS256', () => {
    expect(lookupAlgorithm(Algorithms.PS256)).toBe('PS256');
  });

  it('should return correct algorithm name for PS384', () => {
    expect(lookupAlgorithm(Algorithms.PS384)).toBe('PS384');
  });

  it('should return correct algorithm name for PS512', () => {
    expect(lookupAlgorithm(Algorithms.PS512)).toBe('PS512');
  });

  it('should return correct algorithm name for RS256', () => {
    expect(lookupAlgorithm(Algorithms.RS256)).toBe('RS256');
  });

  it('should return correct algorithm name for RS384', () => {
    expect(lookupAlgorithm(Algorithms.RS384)).toBe('RS384');
  });

  it('should return correct algorithm name for RS512', () => {
    expect(lookupAlgorithm(Algorithms.RS512)).toBe('RS512');
  });

  it('should throw error for invalid algorithm', () => {
    expect(() => lookupAlgorithm(999 as Algorithms)).toThrow(
      'Invalid algorithm'
    );
  });

  it('should throw error for undefined algorithm', () => {
    expect(() => lookupAlgorithm(undefined)).toThrow('Invalid algorithm');
  });
});
