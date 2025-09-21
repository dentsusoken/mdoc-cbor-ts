import { describe, it, expect } from 'vitest';
import { EcPublicKey, EcPublicKeyEntries } from '../EcPublicKey';
import { KeyParams, KeyTypes, Curves, Algorithms, KeyOps } from '../types';

describe('EcPublicKey', () => {
  describe('construction', () => {
    it('creates a new EcPublicKey instance', () => {
      const keyMap = new EcPublicKey();
      expect(keyMap).toBeInstanceOf(EcPublicKey);
      expect(typeof keyMap.set).toBe('function');
      expect(typeof keyMap.get).toBe('function');
      expect(typeof keyMap.has).toBe('function');
      expect(typeof keyMap.delete).toBe('function');
    });

    it('creates with various initial entries', () => {
      const xCoordinate = new Uint8Array([0x01, 0x02, 0x03]);
      const yCoordinate = new Uint8Array([0x04, 0x05, 0x06]);
      const keyId = new Uint8Array([0x07, 0x08, 0x09]);

      const entries: EcPublicKeyEntries = [
        [KeyParams.KeyType, KeyTypes.EC],
        [KeyParams.Curve, Curves.P256],
        [KeyParams.Algorithm, Algorithms.ES256],
        [KeyParams.KeyOps, [KeyOps.Sign, KeyOps.Verify]],
        [KeyParams.x, xCoordinate],
        [KeyParams.y, yCoordinate],
        [KeyParams.KeyId, keyId],
      ];

      const keyMap = new EcPublicKey(entries);

      expect(keyMap.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(keyMap.get(KeyParams.Curve)).toBe(Curves.P256);
      expect(keyMap.get(KeyParams.Algorithm)).toBe(Algorithms.ES256);
      expect(keyMap.get(KeyParams.KeyOps)).toEqual([
        KeyOps.Sign,
        KeyOps.Verify,
      ]);
      expect(keyMap.get(KeyParams.x)).toEqual(xCoordinate);
      expect(keyMap.get(KeyParams.y)).toEqual(yCoordinate);
      expect(keyMap.get(KeyParams.KeyId)).toEqual(keyId);
    });

    it('creates a new EcPublicKey with no entries', () => {
      const keyMap = new EcPublicKey();

      expect(keyMap).toBeDefined();
      expect(keyMap.get(KeyParams.KeyType)).toBeUndefined();
      expect(keyMap.get(KeyParams.Curve)).toBeUndefined();
      expect(keyMap.get(KeyParams.Algorithm)).toBeUndefined();
    });

    it('creates a new EcPublicKey with undefined entries', () => {
      const keyMap = new EcPublicKey(undefined);

      expect(keyMap).toBeDefined();
      expect(keyMap.get(KeyParams.KeyType)).toBeUndefined();
      expect(keyMap.get(KeyParams.Curve)).toBeUndefined();
      expect(keyMap.get(KeyParams.Algorithm)).toBeUndefined();
    });
  });

  describe('complete EC public key scenarios', () => {
    it('creates a complete P-256 EC public key', () => {
      const keyMap = new EcPublicKey();
      const xCoordinate = new Uint8Array([
        0x04, 0x8d, 0x7e, 0x4b, 0x5e, 0x2a, 0x3c, 0x1f, 0x9e, 0x6b, 0x8a, 0x2d,
        0x5c, 0x3f, 0x1a, 0x7e, 0x9b, 0x4d, 0x2c, 0x6f, 0x8a, 0x1e, 0x5b, 0x3d,
        0x7c, 0x9f, 0x2a, 0x6e, 0x4b, 0x1d, 0x8c, 0x5f,
      ]);
      const yCoordinate = new Uint8Array([
        0x02, 0x3a, 0x7c, 0x9e, 0x1f, 0x4b, 0x6d, 0x8a, 0x2c, 0x5f, 0x7e, 0x1b,
        0x4d, 0x6c, 0x9f, 0x2a, 0x5e, 0x8b, 0x1d, 0x4c, 0x7f, 0x9a, 0x2e, 0x5b,
        0x8d, 0x1c, 0x4f, 0x6a, 0x9e, 0x2b, 0x5d, 0x8c,
      ]);

      keyMap.set(KeyParams.KeyType, KeyTypes.EC);
      keyMap.set(KeyParams.Curve, Curves.P256);
      keyMap.set(KeyParams.Algorithm, Algorithms.ES256);
      keyMap.set(KeyParams.KeyOps, [KeyOps.Sign, KeyOps.Verify]);
      keyMap.set(KeyParams.x, xCoordinate);
      keyMap.set(KeyParams.y, yCoordinate);

      expect(keyMap.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(keyMap.get(KeyParams.Curve)).toBe(Curves.P256);
      expect(keyMap.get(KeyParams.Algorithm)).toBe(Algorithms.ES256);
      expect(keyMap.get(KeyParams.KeyOps)).toEqual([
        KeyOps.Sign,
        KeyOps.Verify,
      ]);
      expect(keyMap.get(KeyParams.x)).toEqual(xCoordinate);
      expect(keyMap.get(KeyParams.y)).toEqual(yCoordinate);
    });

    it('creates a complete P-384 EC public key', () => {
      const keyMap = new EcPublicKey();
      const xCoordinate = new Uint8Array([
        0x04, 0x8d, 0x7e, 0x4b, 0x5e, 0x2a, 0x3c, 0x1f, 0x9e, 0x6b, 0x8a, 0x2d,
        0x5c, 0x3f, 0x1a, 0x7e, 0x9b, 0x4d, 0x2c, 0x6f, 0x8a, 0x1e, 0x5b, 0x3d,
        0x7c, 0x9f, 0x2a, 0x6e, 0x4b, 0x1d, 0x8c, 0x5f, 0x3a, 0x7e, 0x9b, 0x4d,
        0x2c, 0x6f, 0x8a, 0x1e, 0x5b, 0x3d, 0x7c, 0x9f, 0x2a, 0x6e, 0x4b, 0x1d,
      ]);
      const yCoordinate = new Uint8Array([
        0x02, 0x3a, 0x7c, 0x9e, 0x1f, 0x4b, 0x6d, 0x8a, 0x2c, 0x5f, 0x7e, 0x1b,
        0x4d, 0x6c, 0x9f, 0x2a, 0x5e, 0x8b, 0x1d, 0x4c, 0x7f, 0x9a, 0x2e, 0x5b,
        0x8d, 0x1c, 0x4f, 0x6a, 0x9e, 0x2b, 0x5d, 0x8c, 0x1a, 0x4e, 0x7b, 0x9d,
        0x2c, 0x5f, 0x8a, 0x1e, 0x4b, 0x6d, 0x9c, 0x2f, 0x5a, 0x8e, 0x1b, 0x4d,
      ]);

      keyMap.set(KeyParams.KeyType, KeyTypes.EC);
      keyMap.set(KeyParams.Curve, Curves.P384);
      keyMap.set(KeyParams.Algorithm, Algorithms.ES384);
      keyMap.set(KeyParams.KeyOps, [KeyOps.Sign, KeyOps.Verify]);
      keyMap.set(KeyParams.x, xCoordinate);
      keyMap.set(KeyParams.y, yCoordinate);

      expect(keyMap.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(keyMap.get(KeyParams.Curve)).toBe(Curves.P384);
      expect(keyMap.get(KeyParams.Algorithm)).toBe(Algorithms.ES384);
      expect(keyMap.get(KeyParams.KeyOps)).toEqual([
        KeyOps.Sign,
        KeyOps.Verify,
      ]);
      expect(keyMap.get(KeyParams.x)).toEqual(xCoordinate);
      expect(keyMap.get(KeyParams.y)).toEqual(yCoordinate);
    });

    it('creates a complete P-521 EC public key', () => {
      const keyMap = new EcPublicKey();
      const xCoordinate = new Uint8Array([
        0x04, 0x8d, 0x7e, 0x4b, 0x5e, 0x2a, 0x3c, 0x1f, 0x9e, 0x6b, 0x8a, 0x2d,
        0x5c, 0x3f, 0x1a, 0x7e, 0x9b, 0x4d, 0x2c, 0x6f, 0x8a, 0x1e, 0x5b, 0x3d,
        0x7c, 0x9f, 0x2a, 0x6e, 0x4b, 0x1d, 0x8c, 0x5f, 0x3a, 0x7e, 0x9b, 0x4d,
        0x2c, 0x6f, 0x8a, 0x1e, 0x5b, 0x3d, 0x7c, 0x9f, 0x2a, 0x6e, 0x4b, 0x1d,
        0x8c, 0x5f, 0x3a, 0x7e, 0x9b, 0x4d, 0x2c, 0x6f, 0x8a, 0x1e, 0x5b, 0x3d,
        0x7c, 0x9f, 0x2a, 0x6e, 0x4b, 0x1d, 0x8c, 0x5f, 0x3a, 0x7e,
      ]);
      const yCoordinate = new Uint8Array([
        0x02, 0x3a, 0x7c, 0x9e, 0x1f, 0x4b, 0x6d, 0x8a, 0x2c, 0x5f, 0x7e, 0x1b,
        0x4d, 0x6c, 0x9f, 0x2a, 0x5e, 0x8b, 0x1d, 0x4c, 0x7f, 0x9a, 0x2e, 0x5b,
        0x8d, 0x1c, 0x4f, 0x6a, 0x9e, 0x2b, 0x5d, 0x8c, 0x1a, 0x4e, 0x7b, 0x9d,
        0x2c, 0x5f, 0x8a, 0x1e, 0x4b, 0x6d, 0x9c, 0x2f, 0x5a, 0x8e, 0x1b, 0x4d,
        0x7c, 0x9f, 0x2a, 0x6e, 0x4b, 0x1d, 0x8c, 0x5f, 0x3a, 0x7e, 0x9b, 0x4d,
        0x2c, 0x6f, 0x8a, 0x1e, 0x4b, 0x6d, 0x9c, 0x2f, 0x5a, 0x8e,
      ]);

      keyMap.set(KeyParams.KeyType, KeyTypes.EC);
      keyMap.set(KeyParams.Curve, Curves.P521);
      keyMap.set(KeyParams.Algorithm, Algorithms.ES512);
      keyMap.set(KeyParams.KeyOps, [KeyOps.Sign, KeyOps.Verify]);
      keyMap.set(KeyParams.x, xCoordinate);
      keyMap.set(KeyParams.y, yCoordinate);

      expect(keyMap.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(keyMap.get(KeyParams.Curve)).toBe(Curves.P521);
      expect(keyMap.get(KeyParams.Algorithm)).toBe(Algorithms.ES512);
      expect(keyMap.get(KeyParams.KeyOps)).toEqual([
        KeyOps.Sign,
        KeyOps.Verify,
      ]);
      expect(keyMap.get(KeyParams.x)).toEqual(xCoordinate);
      expect(keyMap.get(KeyParams.y)).toEqual(yCoordinate);
    });
  });

  describe('modification scenarios', () => {
    it('allows modification of parameters after initial creation', () => {
      const keyMap = new EcPublicKey();
      const initialX = new Uint8Array([0x01, 0x02, 0x03]);
      const initialY = new Uint8Array([0x04, 0x05, 0x06]);

      // Set initial values
      keyMap.set(KeyParams.KeyType, KeyTypes.EC);
      keyMap.set(KeyParams.Curve, Curves.P256);
      keyMap.set(KeyParams.Algorithm, Algorithms.ES256);
      keyMap.set(KeyParams.x, initialX);
      keyMap.set(KeyParams.y, initialY);

      // Verify initial values
      expect(keyMap.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(keyMap.get(KeyParams.Curve)).toBe(Curves.P256);
      expect(keyMap.get(KeyParams.Algorithm)).toBe(Algorithms.ES256);
      expect(keyMap.get(KeyParams.x)).toEqual(initialX);
      expect(keyMap.get(KeyParams.y)).toEqual(initialY);

      // Modify values
      const newX = new Uint8Array([0x07, 0x08, 0x09]);
      const newY = new Uint8Array([0x0a, 0x0b, 0x0c]);

      keyMap.set(KeyParams.Curve, Curves.P384);
      keyMap.set(KeyParams.Algorithm, Algorithms.ES384);
      keyMap.set(KeyParams.x, newX);
      keyMap.set(KeyParams.y, newY);

      // Verify modified values
      expect(keyMap.get(KeyParams.KeyType)).toBe(KeyTypes.EC);
      expect(keyMap.get(KeyParams.Curve)).toBe(Curves.P384);
      expect(keyMap.get(KeyParams.Algorithm)).toBe(Algorithms.ES384);
      expect(keyMap.get(KeyParams.x)).toEqual(newX);
      expect(keyMap.get(KeyParams.y)).toEqual(newY);
    });

    it('allows adding parameters after initial creation', () => {
      const keyMap = new EcPublicKey();

      // Start with basic parameters
      keyMap.set(KeyParams.KeyType, KeyTypes.EC);
      keyMap.set(KeyParams.Curve, Curves.P256);

      expect(keyMap.has(KeyParams.KeyType)).toBe(true);
      expect(keyMap.has(KeyParams.Curve)).toBe(true);
      expect(keyMap.has(KeyParams.Algorithm)).toBe(false);
      expect(keyMap.has(KeyParams.KeyOps)).toBe(false);

      // Add more parameters
      keyMap.set(KeyParams.Algorithm, Algorithms.ES256);
      keyMap.set(KeyParams.KeyOps, [KeyOps.Sign, KeyOps.Verify]);
      keyMap.set(KeyParams.x, new Uint8Array([0x01, 0x02, 0x03]));
      keyMap.set(KeyParams.y, new Uint8Array([0x04, 0x05, 0x06]));

      expect(keyMap.has(KeyParams.Algorithm)).toBe(true);
      expect(keyMap.has(KeyParams.KeyOps)).toBe(true);
      expect(keyMap.has(KeyParams.x)).toBe(true);
      expect(keyMap.has(KeyParams.y)).toBe(true);
    });

    it('allows removing parameters', () => {
      const keyMap = new EcPublicKey();

      // Set all parameters
      keyMap.set(KeyParams.KeyType, KeyTypes.EC);
      keyMap.set(KeyParams.Curve, Curves.P256);
      keyMap.set(KeyParams.Algorithm, Algorithms.ES256);
      keyMap.set(KeyParams.KeyOps, [KeyOps.Sign, KeyOps.Verify]);
      keyMap.set(KeyParams.x, new Uint8Array([0x01, 0x02, 0x03]));
      keyMap.set(KeyParams.y, new Uint8Array([0x04, 0x05, 0x06]));

      // Verify all are present
      expect(keyMap.has(KeyParams.KeyType)).toBe(true);
      expect(keyMap.has(KeyParams.Curve)).toBe(true);
      expect(keyMap.has(KeyParams.Algorithm)).toBe(true);
      expect(keyMap.has(KeyParams.KeyOps)).toBe(true);
      expect(keyMap.has(KeyParams.x)).toBe(true);
      expect(keyMap.has(KeyParams.y)).toBe(true);

      // Remove some parameters
      keyMap.delete(KeyParams.Algorithm);
      keyMap.delete(KeyParams.KeyOps);
      keyMap.delete(KeyParams.x);

      // Verify removal
      expect(keyMap.has(KeyParams.KeyType)).toBe(true);
      expect(keyMap.has(KeyParams.Curve)).toBe(true);
      expect(keyMap.has(KeyParams.Algorithm)).toBe(false);
      expect(keyMap.has(KeyParams.KeyOps)).toBe(false);
      expect(keyMap.has(KeyParams.x)).toBe(false);
      expect(keyMap.has(KeyParams.y)).toBe(true);
    });
  });
});
