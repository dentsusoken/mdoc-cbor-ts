import { describe, it, expect } from 'vitest';
import { formatMessage } from '../formatMessage';

describe('formatMessage', () => {
  it('should return trimmed message when no colon exists', () => {
    expect(formatMessage('  No colon here  ')).toBe('No colon here');
  });

  it('should return text after the first colon, trimmed', () => {
    expect(formatMessage('Label:   Detail error  ')).toBe('Detail error');
  });

  it('should keep everything after the first colon when multiple colons exist', () => {
    expect(formatMessage('Field: must be one of: A, B')).toBe(
      'must be one of: A, B'
    );
  });

  it('should not strip when the left side is not a path (contains dashes)', () => {
    const msg = 'Expected YYYY-MM-DDTHH:MM:SSZ format, received not-a-datetime';
    expect(formatMessage(msg)).toBe(msg);
  });

  it('should treat object/array paths as paths and strip them', () => {
    expect(formatMessage('Aaa[0].key: hoge')).toBe('hoge');
  });

  it('should return empty string when input is empty', () => {
    expect(formatMessage('')).toBe('');
  });
  it('should default to "Invalid value" when called without argument', () => {
    expect(formatMessage()).toBe('Invalid value');
  });

  it('should return empty string when colon exists but no message after it', () => {
    expect(formatMessage('Label:')).toBe('');
  });
});
