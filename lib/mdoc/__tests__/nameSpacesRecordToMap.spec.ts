import { describe, expect, it } from 'vitest';
import { nameSpacesRecordToMap } from '../nameSpacesRecordToMap';

describe('nameSpacesRecordToMap', () => {
  it('converts a single namespace Record to Map', () => {
    const record = {
      'org.iso.18013.5.1': {
        given_name: 'John',
        family_name: 'Doe',
      },
    };

    const result = nameSpacesRecordToMap(record);

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(1);
    expect(result.get('org.iso.18013.5.1')).toBeInstanceOf(Map);
    expect(result.get('org.iso.18013.5.1')?.get('given_name')).toBe('John');
    expect(result.get('org.iso.18013.5.1')?.get('family_name')).toBe('Doe');
  });

  it('converts multiple namespaces Record to Map', () => {
    const record = {
      'org.iso.18013.5.1': {
        given_name: 'Alice',
        age: 30,
      },
      'com.example': {
        membership_id: '12345',
        status: 'active',
      },
    };

    const result = nameSpacesRecordToMap(record);

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(2);
    expect(result.get('org.iso.18013.5.1')).toBeInstanceOf(Map);
    expect(result.get('org.iso.18013.5.1')?.get('given_name')).toBe('Alice');
    expect(result.get('org.iso.18013.5.1')?.get('age')).toBe(30);
    expect(result.get('com.example')).toBeInstanceOf(Map);
    expect(result.get('com.example')?.get('membership_id')).toBe('12345');
    expect(result.get('com.example')?.get('status')).toBe('active');
  });

  it('converts empty Record to empty Map', () => {
    const record = {};

    const result = nameSpacesRecordToMap(record);

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  it('converts Record with empty items to Map with empty Maps', () => {
    const record = {
      'org.iso.18013.5.1': {},
      'com.example': {
        key: 'value',
      },
    };

    const result = nameSpacesRecordToMap(record);

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(2);
    expect(result.get('org.iso.18013.5.1')).toBeInstanceOf(Map);
    expect(result.get('org.iso.18013.5.1')?.size).toBe(0);
    expect(result.get('com.example')).toBeInstanceOf(Map);
    expect(result.get('com.example')?.get('key')).toBe('value');
  });

  it('preserves all value types in the conversion', () => {
    const record = {
      'org.iso.18013.5.1': {
        string_value: 'text',
        number_value: 42,
        boolean_value: true,
        null_value: null,
        array_value: [1, 2, 3],
        object_value: { nested: 'value' },
      },
    };

    const result = nameSpacesRecordToMap(record);

    const namespaceMap = result.get('org.iso.18013.5.1');
    expect(namespaceMap?.get('string_value')).toBe('text');
    expect(namespaceMap?.get('number_value')).toBe(42);
    expect(namespaceMap?.get('boolean_value')).toBe(true);
    expect(namespaceMap?.get('null_value')).toBeNull();
    expect(namespaceMap?.get('array_value')).toEqual([1, 2, 3]);
    expect(namespaceMap?.get('object_value')).toEqual({ nested: 'value' });
  });
});
