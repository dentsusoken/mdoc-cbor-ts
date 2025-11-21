import { describe, it, expect } from 'vitest';
import { toSign1 } from '../toSign1';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { Tag } from 'cbor-x';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { Sign1 } from '../Sign1';
import { encodeCbor } from '@/cbor/codec';

describe('toSign1', () => {
  describe('success cases', () => {
    it('should convert a valid Tag 18 to Sign1 instance', () => {
      const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]);
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const signature = new Uint8Array(64);

      const tag18Content: Tag18Content = [
        protectedHeaders,
        unprotectedHeaders,
        payload,
        signature,
      ];
      const tag18 = createTag18(tag18Content);

      const result = toSign1(tag18);

      expect(result).toBeInstanceOf(Sign1);
      expect(result.protectedHeaders).toBe(protectedHeaders);
      expect(result.unprotectedHeaders).toBe(unprotectedHeaders);
      expect(result.payload).toBe(payload);
      expect(result.signature).toBe(signature);
    });

    it('should convert a valid Tag 18 with null payload to Sign1 instance', () => {
      const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]);
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = null;
      const signature = new Uint8Array(64);

      const tag18Content: Tag18Content = [
        protectedHeaders,
        unprotectedHeaders,
        payload,
        signature,
      ];
      const tag18 = createTag18(tag18Content);

      const result = toSign1(tag18);

      expect(result).toBeInstanceOf(Sign1);
      expect(result.protectedHeaders).toBe(protectedHeaders);
      expect(result.unprotectedHeaders).toBe(unprotectedHeaders);
      expect(result.payload).toBeNull();
      expect(result.signature).toBe(signature);
    });

    it('should convert a valid Tag 18 with empty protected headers map to Sign1 instance', () => {
      const protectedHeaders = encodeCbor(new Map<number, unknown>());
      const unprotectedHeaders = new Map<number, unknown>();
      const payload = new Uint8Array([]);
      const signature = new Uint8Array([]);

      const tag18Content: Tag18Content = [
        protectedHeaders,
        unprotectedHeaders,
        payload,
        signature,
      ];
      const tag18 = createTag18(tag18Content);

      const result = toSign1(tag18);

      expect(result).toBeInstanceOf(Sign1);
      expect(result.protectedHeaders).toEqual(protectedHeaders);
      expect(result.unprotectedHeaders).toBe(unprotectedHeaders);
      expect(result.payload).toEqual(payload);
      expect(result.signature).toEqual(signature);
    });
  });

  describe('error cases', () => {
    it('should throw ErrorCodeError when input is not a Tag instance', () => {
      const notATag = { tag: 18, value: [] };

      try {
        toSign1(notATag as Tag);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Input must be a Tag instance - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }
    });

    it('should throw ErrorCodeError when tag number is not 18', () => {
      const tag17 = new Tag([], 17);
      const tag19 = new Tag([], 19);

      try {
        toSign1(tag17);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Expected Tag(18), but received Tag(17) - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }

      try {
        toSign1(tag19);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Expected Tag(18), but received Tag(19) - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }
    });

    it('should throw ErrorCodeError when tag value is not an array', () => {
      const tag18WithString = new Tag('not an array', 18);
      const tag18WithObject = new Tag({}, 18);
      const tag18WithNumber = new Tag(123, 18);

      try {
        toSign1(tag18WithString);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toContain('Tag 18 value must be an array');
      }

      try {
        toSign1(tag18WithObject);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
      }

      try {
        toSign1(tag18WithNumber);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
      }
    });

    it('should throw ErrorCodeError when array length is not 4', () => {
      const tag18WithEmptyArray = new Tag([], 18);
      const tag18With3Elements = new Tag(
        [new Uint8Array(), new Map(), new Uint8Array()],
        18
      );
      const tag18With5Elements = new Tag(
        [
          new Uint8Array(),
          new Map(),
          new Uint8Array(),
          new Uint8Array(),
          new Uint8Array(),
        ],
        18
      );

      try {
        toSign1(tag18WithEmptyArray);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Sign1Tuple must have 4 elements, but received 0 - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }

      try {
        toSign1(tag18With3Elements);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Sign1Tuple must have 4 elements, but received 3 - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }

      try {
        toSign1(tag18With5Elements);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Sign1Tuple must have 4 elements, but received 5 - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }
    });

    it('should throw ErrorCodeError when protectedHeaders is not a Uint8Array', () => {
      const tag18 = new Tag(
        ['not a Uint8Array', new Map(), new Uint8Array(), new Uint8Array()],
        18
      );

      try {
        toSign1(tag18);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Sign1Tuple[0] (protectedHeaders) must be a Uint8Array - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }
    });

    it('should throw ErrorCodeError when unprotectedHeaders is not a Map', () => {
      const tag18 = new Tag(
        [new Uint8Array(), 'not a Map', new Uint8Array(), new Uint8Array()],
        18
      );

      try {
        toSign1(tag18);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Sign1Tuple[1] (unprotectedHeaders) must be a Map - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }
    });

    it('should throw ErrorCodeError when payload is not a Uint8Array or null', () => {
      const tag18WithStringPayload = new Tag(
        [
          new Uint8Array(),
          new Map(),
          'not a Uint8Array or null',
          new Uint8Array(),
        ],
        18
      );

      const tag18WithNumberPayload = new Tag(
        [new Uint8Array(), new Map(), 123, new Uint8Array()],
        18
      );

      try {
        toSign1(tag18WithStringPayload);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Sign1Tuple[2] (payload) must be a Uint8Array or null - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }

      try {
        toSign1(tag18WithNumberPayload);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Sign1Tuple[2] (payload) must be a Uint8Array or null - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }
    });

    it('should throw ErrorCodeError when signature is not a Uint8Array', () => {
      const tag18 = new Tag(
        [new Uint8Array(), new Map(), new Uint8Array(), 'not a Uint8Array'],
        18
      );

      try {
        toSign1(tag18);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.Sign1ConversionFailed);
        expect(err.message).toBe(
          `Sign1Tuple[3] (signature) must be a Uint8Array - ${MdocErrorCode.Sign1ConversionFailed} - Sign1ConversionFailed`
        );
      }
    });
  });
});
