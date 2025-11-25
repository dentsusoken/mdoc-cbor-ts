import { describe, it, expect } from 'vitest';
import { getErrorCodeMessage } from '../getErrorCodeMessage';
import { MdocErrorCode } from '../types';

describe('getErrorCodeMessage', () => {
  describe('general errors (0-99)', () => {
    it('should return correct message for DataNotReturned', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DataNotReturned)).toBe(
        'Data that was requested was not returned.'
      );
    });

    it('should return correct message for CborDecodingError', () => {
      expect(getErrorCodeMessage(MdocErrorCode.CborDecodingError)).toBe(
        'Failure decoding CBOR data.'
      );
    });

    it('should return correct message for CborValidationError', () => {
      expect(getErrorCodeMessage(MdocErrorCode.CborValidationError)).toBe(
        'Failure validating CBOR against schema or specification.'
      );
    });
  });

  describe('document-level errors (2000-2999)', () => {
    it('should return correct message for ValueDigestsMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.ValueDigestsMissing)).toBe(
        'Value digests are missing.'
      );
    });

    it('should return correct message for DocumentNotValidYet', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DocumentNotValidYet)).toBe(
        'Document is not valid yet.'
      );
    });

    it('should return correct message for DocumentExpired', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DocumentExpired)).toBe(
        'Document has expired.'
      );
    });

    it('should return correct message for ValidFromMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.ValidFromMissing)).toBe(
        'ValidFrom is missing.'
      );
    });

    it('should return correct message for ValidUntilMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.ValidUntilMissing)).toBe(
        'ValidUntil is missing.'
      );
    });

    it('should return correct message for IssuerNameSpacesMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.IssuerNameSpacesMissing)).toBe(
        'The issuer name spaces are missing.'
      );
    });

    it('should return correct message for IssuerAuthMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.IssuerAuthMissing)).toBe(
        'The issuer authentication is missing.'
      );
    });

    it('should return correct message for IssuerAuthInvalid', () => {
      expect(getErrorCodeMessage(MdocErrorCode.IssuerAuthInvalid)).toBe(
        'IssuerAuth is invalid.'
      );
    });

    it('should return correct message for X5ChainVerificationFailed', () => {
      expect(getErrorCodeMessage(MdocErrorCode.X5ChainVerificationFailed)).toBe(
        'Failed to verify the X.509 certificate chain.'
      );
    });

    it('should return correct message for IssuerAuthSignatureVerificationFailed', () => {
      expect(
        getErrorCodeMessage(MdocErrorCode.IssuerAuthSignatureVerificationFailed)
      ).toBe('Failed to verify the IssuerAuth signature.');
    });

    it('should return correct message for IssuerAuthPayloadDecodingFailed', () => {
      expect(
        getErrorCodeMessage(MdocErrorCode.IssuerAuthPayloadDecodingFailed)
      ).toBe('Failed to decode the IssuerAuth payload.');
    });

    it('should return correct message for MobileSecurityObjectInvalid', () => {
      expect(
        getErrorCodeMessage(MdocErrorCode.MobileSecurityObjectInvalid)
      ).toBe('MobileSecurityObject is invalid.');
    });

    it('should return correct message for DetachedPayloadRequired', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DetachedPayloadRequired)).toBe(
        'Detached payload is required when payload is null.'
      );
    });

    it('should return correct message for InvalidInputDescriptorFieldPath', () => {
      expect(
        getErrorCodeMessage(MdocErrorCode.InvalidInputDescriptorFieldPath)
      ).toBe('Invalid input descriptor field path.');
    });

    it('should return correct message for DocTypeMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DocTypeMissing)).toBe(
        'The document type is missing.'
      );
    });

    it('should return correct message for IssuerSignedMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.IssuerSignedMissing)).toBe(
        'The issuer-signed structure is missing.'
      );
    });

    it('should return correct message for ClaimSetsPresentWhenClaimsAbsent', () => {
      expect(
        getErrorCodeMessage(MdocErrorCode.ClaimSetsPresentWhenClaimsAbsent)
      ).toBe('Claim sets are present when claims are absent.');
    });

    it('should return correct message for IssuerNameSpacesSelectionFailed', () => {
      expect(
        getErrorCodeMessage(MdocErrorCode.IssuerNameSpacesSelectionFailed)
      ).toBe('Failed to select issuer name spaces.');
    });

    it('should return correct message for IssuerSignedItemCborDecodingError', () => {
      expect(
        getErrorCodeMessage(MdocErrorCode.IssuerSignedItemCborDecodingError)
      ).toBe('Failed to cbor-decode the issuer-signed item.');
    });

    it('should return correct message for IssuerSignedItemCborValidationError', () => {
      expect(
        getErrorCodeMessage(MdocErrorCode.IssuerSignedItemCborValidationError)
      ).toBe('Failed to validate the issuer-signed item structure.');
    });

    it('should return correct message for ValueDigestMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.ValueDigestMissing)).toBe(
        'Value digest is missing.'
      );
    });

    it('should return correct message for ValueDigestMismatch', () => {
      expect(getErrorCodeMessage(MdocErrorCode.ValueDigestMismatch)).toBe(
        'Value digest does not match the expected digest.'
      );
    });

    it('should return correct message for SignedMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.SignedMissing)).toBe(
        'Signed is missing.'
      );
    });

    it('should return correct message for VersionMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.VersionMissing)).toBe(
        'Version is missing.'
      );
    });

    it('should return correct message for DigestAlgorithmMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DigestAlgorithmMissing)).toBe(
        'Digest algorithm is missing.'
      );
    });

    it('should return correct message for DeviceKeyInfoMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DeviceKeyInfoMissing)).toBe(
        'Device key info is missing.'
      );
    });

    it('should return correct message for ValidityInfoMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.ValidityInfoMissing)).toBe(
        'Validity info is missing.'
      );
    });

    it('should return correct message for IssuerSignedVerificationFailed', () => {
      expect(
        getErrorCodeMessage(MdocErrorCode.IssuerSignedVerificationFailed)
      ).toBe('Failed to verify Issuer-Signed.');
    });

    it('should return correct message for DeviceNameSpacesMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DeviceNameSpacesMissing)).toBe(
        'The device name spaces are missing.'
      );
    });

    it('should return correct message for DeviceAuthMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DeviceAuthMissing)).toBe(
        'The device authentication is missing.'
      );
    });

    it('should return correct message for DeviceSignatureMissing', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DeviceSignatureMissing)).toBe(
        'The device signature is missing.'
      );
    });

    it('should return correct message for DeviceMacNotSupported', () => {
      expect(getErrorCodeMessage(MdocErrorCode.DeviceMacNotSupported)).toBe(
        'The device MAC is not supported.'
      );
    });

    it('should return correct message for Sign1ConversionFailed', () => {
      expect(getErrorCodeMessage(MdocErrorCode.Sign1ConversionFailed)).toBe(
        'Failed to convert Tag 18 to Sign1.'
      );
    });
  });

  describe('coverage', () => {
    it('should have a message for all MdocErrorCode values', () => {
      // Get all enum values
      const errorCodes = Object.values(MdocErrorCode).filter(
        (value): value is MdocErrorCode => typeof value === 'number'
      );

      // Test that all error codes return a non-empty message
      for (const errorCode of errorCodes) {
        const message = getErrorCodeMessage(errorCode);
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      }
    });
  });
});
