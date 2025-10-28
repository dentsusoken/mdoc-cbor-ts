import { describe, expect, it } from 'vitest';
import { ErrorCodeError } from '../ErrorCodeError';
import { MDocErrorCode } from '../types';

describe('NameSpaceError', () => {
  it('should set name, nameSpace, errorCode, and message correctly', () => {
    const nameSpace = 'org.iso.18013.5.1';
    const errorCode = MDocErrorCode.ValueDigestsMissingForNamespace;

    const err = new ErrorCodeError(nameSpace, errorCode);

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('NameSpaceError');
    expect(err.nameSpace).toBe(nameSpace);
    expect(err.errorCode).toBe(errorCode);
    expect(err.message).toBe(
      `${nameSpace} - ${errorCode} - ${MDocErrorCode[errorCode]}`
    );
  });

  it('should still construct even if code is not a known enum member', () => {
    const nameSpace = 'example.namespace';
    const unknownCode = 1999; // not mapped in enum

    const err = new ErrorCodeError(nameSpace, unknownCode);

    expect(err.name).toBe('NameSpaceError');
    expect(err.nameSpace).toBe(nameSpace);
    expect(err.errorCode).toBe(unknownCode);
    // When the code is unknown, the enum lookup yields undefined
    expect(err.message).toBe(`${nameSpace} - ${unknownCode} - ${undefined}`);
  });
});
