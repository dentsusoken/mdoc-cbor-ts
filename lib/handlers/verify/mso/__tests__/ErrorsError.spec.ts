import { describe, it, expect } from 'vitest';
import { ErrorsError } from '../ErrorsError';
import type { Errors } from '@/schemas/error/Errors';

describe('ErrorsError', () => {
  it('stores message and errors, and sets name', () => {
    const errors: Errors = new Map<string, Map<string, number>>([
      ['org.iso.18013.5.1', new Map<string, number>([['given_name', 2002]])],
    ]);

    const err = new ErrorsError('Validation failed', errors);

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ErrorsError');
    expect(err.message).toBe('Validation failed');
    expect(err.errors).toBe(errors);
  });
});
