import { describe, it, expect } from 'vitest';
import { ErrorCodeError } from '../ErrorCodeError';
import { MDocErrorCode } from '../types';

describe('ErrorCodeError', () => {
  it('stores code and sets the correct name', () => {
    const code = MDocErrorCode.CborDecodingError; // 1
    const err = new ErrorCodeError(code);

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ErrorCodeError');
    expect(err.errorCode).toBe(code);
  });

  it('formats message as "<code> - <enumName>"', () => {
    const code = MDocErrorCode.CborValidationError; // 2
    const err = new ErrorCodeError(code);
    expect(err.message).toBe('2 - CborValidationError');
  });

  it('throws with the expected message (DocumentError handling)', () => {
    const code = MDocErrorCode.DeviceSignatureInvalid; // 4001
    expect(() => {
      throw new ErrorCodeError(code);
    }).toThrowError('4001 - DeviceSignatureInvalid');
  });
});


