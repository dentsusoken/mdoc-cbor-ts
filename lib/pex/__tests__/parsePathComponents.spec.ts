import { describe, expect, it } from 'vitest';
import { parsePathComponents } from '../parsePathComponents';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MDocErrorCode } from '@/mdoc/types';

describe('parsePathComponents', () => {
  it('parses nameSpace and elementIdentifier from a valid path', () => {
    const result = parsePathComponents("['org.iso.18013.5.1']['given_name']");
    expect(result).toEqual({
      nameSpace: 'org.iso.18013.5.1',
      elementIdentifier: 'given_name',
    });
  });

  it('parses correctly when the path is prefixed with $', () => {
    const result = parsePathComponents("$['org.iso.18013.5.1']['family_name']");
    expect(result).toEqual({
      nameSpace: 'org.iso.18013.5.1',
      elementIdentifier: 'family_name',
    });
  });

  it('throws ErrorCodeError when nameSpace is empty', () => {
    expect(() => parsePathComponents("['']['given_name']")).toThrow(ErrorCodeError);
    try {
      parsePathComponents("['']['given_name']");
    } catch (e) {
      const err = e as ErrorCodeError;
      expect(err).toBeInstanceOf(ErrorCodeError);
      expect(err.message).toContain('Failed to parse nameSpace');
      expect(err.message).toContain(String(MDocErrorCode.InvalidInputDescriptorFieldPath));
      expect(err.message).toContain('InvalidInputDescriptorFieldPath');
      expect(err).toHaveProperty('errorCode', MDocErrorCode.InvalidInputDescriptorFieldPath);
    }
  });

  it('throws ErrorCodeError when elementIdentifier is empty', () => {
    expect(() => parsePathComponents("['org.iso.18013.5.1']['']")).toThrow(ErrorCodeError);
    try {
      parsePathComponents("['org.iso.18013.5.1']['']");
    } catch (e) {
      const err = e as ErrorCodeError;
      expect(err).toBeInstanceOf(ErrorCodeError);
      expect(err.message).toContain('Failed to parse elementIdentifier');
      expect(err.message).toContain(String(MDocErrorCode.InvalidInputDescriptorFieldPath));
      expect(err.message).toContain('InvalidInputDescriptorFieldPath');
      expect(err).toHaveProperty('errorCode', MDocErrorCode.InvalidInputDescriptorFieldPath);
    }
  });

  it('parses arbitrary namespaces and identifiers', () => {
    const result = parsePathComponents("['com.example.v1']['age']");
    expect(result).toEqual({ nameSpace: 'com.example.v1', elementIdentifier: 'age' });
  });
});


