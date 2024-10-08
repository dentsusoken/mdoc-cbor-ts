import { describe, it, expect } from 'vitest';
import { HashMapItem } from './HashMap';
import { DisclosureMapItem } from './DisclosureMap';

describe('HashMapItem', () => {
  describe('constructor', () => {
    it('should initialize with given DisclosureMapItem', () => {
      const disclosureMapItem = new DisclosureMapItem(1, 'id', 'value');
      const hashMapItem = new HashMapItem(disclosureMapItem);

      expect(hashMapItem.disclosureMapItem).toBe(disclosureMapItem);
    });
  });

  describe('encode', () => {
    it('should encode the HashMapItem to CBOR', () => {
      const disclosureMapItem = new DisclosureMapItem(1, 'id', 'value');
      const hashMapItem = new HashMapItem(disclosureMapItem);
      const encoded = hashMapItem.encode();

      expect(encoded).toBeInstanceOf(Uint8Array);
    });
  });

  describe('digest', () => {
    it('should return a digest of the encoded HashMapItem', async () => {
      const disclosureMapItem = new DisclosureMapItem(1, 'id', 'value');
      const hashMapItem = new HashMapItem(disclosureMapItem);
      const digest = await hashMapItem.digest();

      expect(digest).toBeInstanceOf(ArrayBuffer);
    });
  });
});
