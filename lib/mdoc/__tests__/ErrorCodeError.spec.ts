import { describe, it, expect } from 'vitest';
import { ErrorCodeError } from '../ErrorCodeError';
import { MDocErrorCode } from '../types';

describe('ErrorCodeError', () => {
  it('stores code and sets the correct name', () => {
    const code = MDocErrorCode.CborDecodingError; // 1
    const err = new ErrorCodeError('Test', code);

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ErrorCodeError');
    expect(err.errorCode).toBe(code);
  });

  it('formats message as "<code> - <enumName>"', () => {
    const code = MDocErrorCode.CborValidationError; // 2
    const err = new ErrorCodeError('DocumentError', code);
    expect(err.message).toBe('DocumentError - 2 - CborValidationError');
  });
});
