import { describe, it, expect } from 'vitest';
import { MSOPayload } from './MSOPayload';
import { DateTime } from 'luxon';
import { decode } from 'cbor-x';

describe('MSOPayload', () => {
  describe('constructor', () => {
    it('should initialize with given parameters', () => {
      const validityInfo = {
        signed: DateTime.now(),
        validFrom: DateTime.now(),
        validUntil: DateTime.now().plus({ days: 1 }),
      };
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo,
      });

      expect(payload.digestAlgorithm).toBe('SHA-256');
      expect(payload.docType).toBe('testType');
      expect(payload.validityInfo).toBe(validityInfo);
    });
  });

  describe('encode', () => {
    it('should encode the MSOPayload to CBOR', () => {
      const validityInfo = {
        signed: DateTime.now(),
        validFrom: DateTime.now(),
        validUntil: DateTime.now().plus({ days: 1 }),
      };
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo,
      });
      const encoded = payload.encode();

      expect(encoded).toBeInstanceOf(Uint8Array);
    });
  });

  describe('decode', () => {
    it('should decode a CBOR string to an MSOPayload instance', () => {
      const validityInfo = {
        signed: DateTime.now(),
        validFrom: DateTime.now(),
        validUntil: DateTime.now().plus({ days: 1 }),
      };
      const payload = new MSOPayload({
        digestAlgorithm: 'SHA-256',
        valueDigests: {},
        docType: 'testType',
        validityInfo,
      });
      const encoded = payload.encode();
      const cbor = decode(encoded); // CBOR encoded string
      expect(MSOPayload.decode(cbor)).toBeInstanceOf(MSOPayload);
    });
  });
});
