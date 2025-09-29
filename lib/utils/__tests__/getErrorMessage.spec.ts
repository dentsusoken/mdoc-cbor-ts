import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '..';

describe('getErrorMessage', () => {
  it('returns message from Error instance', () => {
    const err = new Error('boom');
    expect(getErrorMessage(err)).toBe('boom');
  });

  it('returns string as-is', () => {
    expect(getErrorMessage('oops')).toBe('oops');
  });

  it('stringifies number', () => {
    expect(getErrorMessage(404)).toBe('404');
  });

  it('stringifies boolean', () => {
    expect(getErrorMessage(false)).toBe('false');
  });

  it('stringifies null and undefined', () => {
    expect(getErrorMessage(null)).toBe('null');
    expect(getErrorMessage(undefined)).toBe('undefined');
  });

  it('stringifies object via String()', () => {
    const obj = { a: 1 };
    expect(getErrorMessage(obj)).toBe('[object Object]');
  });
});
