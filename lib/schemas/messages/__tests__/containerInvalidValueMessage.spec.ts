import { describe, it, expect } from 'vitest';
import { containerInvalidValueMessage } from '../containerInvalidValueMessage';

describe('containerInvalidValueMessage', () => {
  it('should prefix with target and dot-joined path when no colon present', () => {
    const target = 'UserProfile';
    const path = ['addresses', 0, 'city'];
    const original = 'City is required';
    const result = containerInvalidValueMessage({
      target,
      path,
      originalMessage: original,
    });
    expect(result).toBe('UserProfile.addresses[0].city: City is required');
  });

  it('should remove label before the first colon and trim spaces', () => {
    const target = 'UserProfile';
    const path = ['addresses', 0, 'city'];
    const original = 'UserProfile.addresses[0].city:   Required  ';
    const result = containerInvalidValueMessage({
      target,
      path,
      originalMessage: original,
    });
    expect(result).toBe('UserProfile.addresses[0].city: Required');
  });

  it('should keep text after the first colon when multiple colons exist', () => {
    const target = 'UserProfile';
    const path = ['addresses', 0, 'city'];
    const original = 'City: must be one of: Tokyo, Osaka';
    const result = containerInvalidValueMessage({
      target,
      path,
      originalMessage: original,
    });
    expect(result).toBe(
      'UserProfile.addresses[0].city: must be one of: Tokyo, Osaka'
    );
  });

  it('should handle empty path by using only the target as label', () => {
    const target = 'Container';
    const path: (string | number)[] = [];
    const original = 'Field: Missing';
    const result = containerInvalidValueMessage({
      target,
      path,
      originalMessage: original,
    });
    expect(result).toBe('Container: Missing');
  });

  it('should trim whitespace after the colon in the original message', () => {
    const target = 'Data';
    const path = ['items', 1];
    const original = 'items.1:   Invalid valu  ';
    const result = containerInvalidValueMessage({
      target,
      path,
      originalMessage: original,
    });
    expect(result).toBe('Data.items[1]: Invalid valu');
  });

  it('should handle empty original message', () => {
    const target = 'Config';
    const path = ['env'];
    const original = '';
    const result = containerInvalidValueMessage({
      target,
      path,
      originalMessage: original,
    });
    expect(result).toBe('Config.env: ');
  });

  it('should handle original message ending right after colon (no message part)', () => {
    const target = 'UserProfile';
    const path = ['addresses', 0, 'city'];
    const original = 'UserProfile.addresses.0.city:';
    const result = containerInvalidValueMessage({
      target,
      path,
      originalMessage: original,
    });
    expect(result).toBe('UserProfile.addresses[0].city: ');
  });

  it('should handle original message that is undefined', () => {
    const target = 'Container';
    const path: (string | number)[] = [];
    const result = containerInvalidValueMessage({ target, path });
    expect(result).toBe('Container: Invalid value');
  });
});
