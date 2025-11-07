import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { selectNormalTag } from '../selectNormalTag';
import { EnrichedIssuerSignedItem } from '@/query-lang/common/enrichIssuerSignedItems';

describe('selectNormalTag', () => {
  describe('should return tag when item is found and requestedValues is undefined', () => {
    it('returns tag when requestedIdentifier matches', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        { elementIdentifier: 'given_name', elementValue: 'John', tag: tag1 },
        {
          elementIdentifier: 'family_name',
          elementValue: 'Doe',
          tag: new Tag('value2', 24),
        },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'given_name',
        requestedValues: undefined,
        normalItems,
      });

      expect(result).toBe(tag1);
    });
  });

  describe('should return tag when item is found and elementValue is in requestedValues', () => {
    it('returns tag when elementValue matches single requested value', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        { elementIdentifier: 'given_name', elementValue: 'John', tag: tag1 },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'given_name',
        requestedValues: ['John'],
        normalItems,
      });

      expect(result).toBe(tag1);
    });

    it('returns tag when elementValue is in multiple requested values', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        { elementIdentifier: 'given_name', elementValue: 'John', tag: tag1 },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'given_name',
        requestedValues: ['John', 'Jane', 'Bob'],
        normalItems,
      });

      expect(result).toBe(tag1);
    });

    it('returns tag when elementValue matches second value in requestedValues', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        { elementIdentifier: 'given_name', elementValue: 'Jane', tag: tag1 },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'given_name',
        requestedValues: ['John', 'Jane', 'Bob'],
        normalItems,
      });

      expect(result).toBe(tag1);
    });
  });

  describe('should return undefined when item is not found', () => {
    it('returns undefined when requestedIdentifier does not match', () => {
      const normalItems: EnrichedIssuerSignedItem[] = [
        {
          elementIdentifier: 'given_name',
          elementValue: 'John',
          tag: new Tag('value1', 24),
        },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'family_name',
        requestedValues: undefined,
        normalItems,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('should return undefined when elementIdentifier matches but elementValue is not in requestedValues', () => {
    it('returns undefined when elementIdentifier matches but elementValue does not match single requested value', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        {
          elementIdentifier: 'given_name',
          elementValue: 'John',
          tag: tag1,
        },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'given_name',
        requestedValues: ['Jane'],
        normalItems,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when elementIdentifier matches but elementValue is not in multiple requested values', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        {
          elementIdentifier: 'given_name',
          elementValue: 'John',
          tag: tag1,
        },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'given_name',
        requestedValues: ['Jane', 'Bob', 'Alice'],
        normalItems,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when elementIdentifier matches but requestedValues is empty array', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        {
          elementIdentifier: 'given_name',
          elementValue: 'John',
          tag: tag1,
        },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'given_name',
        requestedValues: [],
        normalItems,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('handles different value types in requestedValues', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        { elementIdentifier: 'age', elementValue: 25, tag: tag1 },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'age',
        requestedValues: [25, 30, 35],
        normalItems,
      });

      expect(result).toBe(tag1);
    });

    it('handles boolean values in requestedValues', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        { elementIdentifier: 'is_active', elementValue: true, tag: tag1 },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'is_active',
        requestedValues: [true, false],
        normalItems,
      });

      expect(result).toBe(tag1);
    });

    it('handles null values in requestedValues', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        { elementIdentifier: 'optional_field', elementValue: null, tag: tag1 },
      ];

      const result = selectNormalTag({
        requestedIdentifier: 'optional_field',
        requestedValues: [null, 'value'],
        normalItems,
      });

      expect(result).toBe(tag1);
    });

    it('handles empty normalItems array', () => {
      const normalItems: EnrichedIssuerSignedItem[] = [];

      const result = selectNormalTag({
        requestedIdentifier: 'given_name',
        requestedValues: undefined,
        normalItems,
      });

      expect(result).toBeUndefined();
    });
  });
});
