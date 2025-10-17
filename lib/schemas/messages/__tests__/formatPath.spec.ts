import { describe, it, expect } from 'vitest';
import { formatPath } from '../formatPath';

describe('formatPath', () => {
  it('should return just the target when path is empty', () => {
    expect(formatPath('foo', [])).toBe('foo');
  });

  it('should join string segments with dots', () => {
    expect(formatPath('foo', ['bar', 'baz'])).toBe('foo.bar.baz');
  });

  it('should format number segments as bracket indices', () => {
    expect(formatPath('foo', [0])).toBe('foo[0]');
    expect(formatPath('root', [12])).toBe('root[12]');
  });

  it('should handle mixed string and number segments', () => {
    expect(formatPath('foo', ['bar', 1, 'baz', 0])).toBe('foo.bar[1].baz[0]');
  });

  it('should handle starting with a number segment in path', () => {
    expect(formatPath('foo', [0, 'bar'])).toBe('foo[0].bar');
  });
});
