import { describe, it, expect, beforeEach } from 'vitest';
import { DisclosureMapItem } from './DisclosureMap';
import { Settings } from '../settings';
import { Tag } from 'cbor-x';

describe('DisclosureMapItem', () => {
  let settingsMock: Settings;

  beforeEach(() => {
    settingsMock = new Settings();
  });

  describe('constructor', () => {
    it('should initialize with given parameters and generate random values', () => {
      const digestID = 1;
      const elementIdentifier = 'testIdentifier';
      const elementValue = 'testValue';

      const item = new DisclosureMapItem(
        digestID,
        elementIdentifier,
        elementValue
      );

      expect(item.digestID).toBe(digestID);
      expect(item.elementIdentifier).toBe(elementIdentifier);
      expect(item.elementValue).toBe(elementValue);
      expect(item.random.length).toEqual(settingsMock.DIGEST_SALT_LENGTH);
    });
    it('should wrap elementValue with Tag if identifier dose not exist in CBORTAGS_ATTR_MAP', () => {
      const digestID = 1;
      const elementIdentifier = 'testIdentifier';
      const elementValue = 'testValue';

      settingsMock.CBORTAGS_ATTR_MAP[elementIdentifier] = 123;

      const item = new DisclosureMapItem(
        digestID,
        elementIdentifier,
        elementValue
      );

      expect(item.elementValue).toBe('testValue');
    });

    it('should wrap elementValue with Tag if identifier exists in CBORTAGS_ATTR_MAP', () => {
      const digestID = 1;
      const elementIdentifier = 'birth_date';
      const elementValue = new Date();

      settingsMock.CBORTAGS_ATTR_MAP[elementIdentifier] = 123;

      const item = new DisclosureMapItem(
        digestID,
        elementIdentifier,
        elementValue
      );

      expect(item.elementValue).toBeInstanceOf(Tag);
      expect((item.elementValue as Tag).value).toBe(elementValue);
      expect((item.elementValue as Tag).tag).toBe(1004);
    });
  });

  describe('toJSON', () => {
    it('should return a JSON representation of the item', () => {
      const digestID = 1;
      const elementIdentifier = 'testIdentifier';
      const elementValue = 'testValue';

      const item = new DisclosureMapItem(
        digestID,
        elementIdentifier,
        elementValue
      );
      const json = item.toJSON();

      expect(json).toEqual({
        random: Buffer.from(item.random),
        digestID: digestID,
        elementIdentifier: elementIdentifier,
        elementValue: elementValue,
      });
    });
  });
});
