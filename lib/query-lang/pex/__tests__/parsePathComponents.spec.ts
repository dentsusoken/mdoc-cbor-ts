import { describe, expect, it } from 'vitest';
import { parsePathComponents } from '../parsePathComponents';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MDocErrorCode } from '@/mdoc/types';

describe('parsePathComponents', () => {
  describe('success cases', () => {
    it('parses nameSpace and elementIdentifier from a valid path', () => {
      const result = parsePathComponents(
        "$['org.iso.18013.5.1']['given_name']"
      );
      expect(result).toEqual({
        nameSpace: 'org.iso.18013.5.1',
        elementIdentifier: 'given_name',
      });
    });

    it('parses correctly when the path is prefixed with $', () => {
      const result = parsePathComponents(
        "$['org.iso.18013.5.1']['family_name']"
      );
      expect(result).toEqual({
        nameSpace: 'org.iso.18013.5.1',
        elementIdentifier: 'family_name',
      });
    });

    it('parses arbitrary namespaces and identifiers', () => {
      const result = parsePathComponents("$['com.example.v1']['age']");
      expect(result).toEqual({
        nameSpace: 'com.example.v1',
        elementIdentifier: 'age',
      });
    });
  });

  describe('error cases', () => {
    it('throws ErrorCodeError when nameSpace is empty', () => {
      const path = "$['']['given_name']";
      try {
        parsePathComponents(path);
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        const code = MDocErrorCode.InvalidInputDescriptorFieldPath;
        const expectedMessage =
          `Failed to parse nameSpace from path "${path}"` +
          ` - ${code} - ${MDocErrorCode[code]}`;
        expect(err.message).toBe(expectedMessage);
        expect(err).toHaveProperty('errorCode', code);
      }
    });

    it('throws ErrorCodeError when elementIdentifier is empty', () => {
      const path = "$['org.iso.18013.5.1']['']";
      try {
        parsePathComponents(path);
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        const code = MDocErrorCode.InvalidInputDescriptorFieldPath;
        const expectedMessage =
          `Failed to parse elementIdentifier from path "${path}"` +
          ` - ${code} - ${MDocErrorCode[code]}`;
        expect(err.message).toBe(expectedMessage);
        expect(err).toHaveProperty('errorCode', code);
      }
    });
  });
});
