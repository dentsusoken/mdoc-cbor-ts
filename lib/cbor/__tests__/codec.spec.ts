import { describe, expect, it } from 'vitest';
import {
  encodeCbor,
  decodeCbor,
  defaultOptions,
  AdvancedOptions,
} from '../codec';
import { Tag } from 'cbor-x';

describe('codec', () => {
  describe('round-trip encoding/decoding', () => {
    it('should handle simple data types', () => {
      const testCases = [
        { input: null, expected: null },
        { input: true, expected: true },
        { input: false, expected: false },
        { input: 42, expected: 42 },
        { input: -123, expected: -123 },
        { input: 3.14, expected: 3.14 },
        { input: 'hello', expected: 'hello' },
        { input: '', expected: '' },
      ];

      testCases.forEach(({ input, expected }) => {
        const encoded = encodeCbor(input);
        const decoded = decodeCbor(encoded);
        expect(decoded).toBe(expected);
      });
    });

    it('should handle arrays', () => {
      const testCases = [
        { input: [], expected: [] },
        { input: [1, 2, 3], expected: [1, 2, 3] },
        { input: ['a', 'b', 'c'], expected: ['a', 'b', 'c'] },
        { input: [null, true, 42], expected: [null, true, 42] },
        {
          input: [
            [1, 2],
            [3, 4],
          ],
          expected: [
            [1, 2],
            [3, 4],
          ],
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const encoded = encodeCbor(input);
        const decoded = decodeCbor(encoded);
        expect(decoded).toEqual(expected);
      });
    });

    it('should handle objects', () => {
      const testCases = [
        { input: {}, expected: new Map() },
        {
          input: { name: 'John', age: 30 },
          expected: new Map<string, string | number>([
            ['name', 'John'],
            ['age', 30],
          ]),
        },
        {
          input: { nested: { key: 'value' } },
          expected: new Map([['nested', new Map([['key', 'value']])]]),
        },
        {
          input: { array: [1, 2, 3] },
          expected: new Map([['array', [1, 2, 3]]]),
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const encoded = encodeCbor(input);
        const decoded = decodeCbor(encoded);
        expect(decoded).toEqual(expected);
      });
    });

    it('should handle Map objects', () => {
      const testCases = [
        { input: new Map(), expected: new Map() },
        {
          input: new Map<string, string | number>([
            ['name', 'John'],
            ['age', 30],
          ]),
          expected: new Map<string, string | number>([
            ['name', 'John'],
            ['age', 30],
          ]),
        },
        {
          input: new Map<string, unknown>([
            ['nested', new Map([['key', 'value']])],
            ['array', [1, 2, 3]],
          ]),
          expected: new Map<string, unknown>([
            ['nested', new Map([['key', 'value']])],
            ['array', [1, 2, 3]],
          ]),
        },
        {
          input: new Map<string, unknown>([
            ['string', 'hello'],
            ['number', 42],
            ['boolean', true],
            ['null', null],
            ['array', [1, 2, 3]],
            ['object', new Map([['nested', 'value']])],
          ]),
          expected: new Map<string, unknown>([
            ['string', 'hello'],
            ['number', 42],
            ['boolean', true],
            ['null', null],
            ['array', [1, 2, 3]],
            ['object', new Map([['nested', 'value']])],
          ]),
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const encoded = encodeCbor(input);
        const decoded = decodeCbor(encoded);
        expect(decoded).toEqual(expected);
      });
    });

    it('should handle Buffer and Uint8Array', () => {
      const uint8Array = new Uint8Array([1, 2, 3, 4]);

      // Test Uint8Array
      const encodedUint8 = encodeCbor(uint8Array);
      const decodedUint8 = decodeCbor(encodedUint8);
      expect(decodedUint8).toEqual(uint8Array);
    });

    it('should handle custom options', () => {
      const data = { key: 'value' };
      const customOptions: AdvancedOptions = {
        useTag259ForMaps: true,
      };

      const encoded = encodeCbor(data, customOptions);
      const decoded = decodeCbor(encoded, customOptions);
      expect(decoded).toEqual(new Map([['key', 'value']]));
    });

    it('should preserve complex nested structures', () => {
      const complexData = {
        string: 'hello',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3, { nested: 'value' }],
        object: {
          deep: {
            nested: {
              array: [1, 2, 3],
              object: { key: 'value' },
            },
          },
        },
      };

      const expected = new Map<string, unknown>([
        ['string', 'hello'],
        ['number', 42],
        ['boolean', true],
        ['null', null],
        ['array', [1, 2, 3, new Map([['nested', 'value']])]],
        [
          'object',
          new Map<string, unknown>([
            [
              'deep',
              new Map([
                [
                  'nested',
                  new Map<string, unknown>([
                    ['array', [1, 2, 3]],
                    ['object', new Map([['key', 'value']])],
                  ]),
                ],
              ]),
            ],
          ]),
        ],
      ]);

      const encoded = encodeCbor(complexData);
      const decoded = decodeCbor(encoded);
      expect(decoded).toEqual(expected);
    });

    it('should handle empty structures', () => {
      const emptyData = {
        emptyObject: {},
        emptyArray: [],
        emptyString: '',
      };

      const expected = new Map<string, unknown>([
        ['emptyObject', new Map()],
        ['emptyArray', []],
        ['emptyString', ''],
      ]);

      const encoded = encodeCbor(emptyData);
      const decoded = decodeCbor(encoded);
      expect(decoded).toEqual(expected);
    });

    it('should handle mixed data types', () => {
      const mixedData = {
        numbers: [1, 2.5, -3, 0],
        strings: ['', 'hello', 'world'],
        booleans: [true, false],
        nulls: [null, null],
        mixed: [1, 'string', true, null, { key: 'value' }],
      };

      const expected = new Map<string, unknown>([
        ['numbers', [1, 2.5, -3, 0]],
        ['strings', ['', 'hello', 'world']],
        ['booleans', [true, false]],
        ['nulls', [null, null]],
        ['mixed', [1, 'string', true, null, new Map([['key', 'value']])]],
      ]);

      const encoded = encodeCbor(mixedData);
      const decoded = decodeCbor(encoded);
      expect(decoded).toEqual(expected);
    });
  });

  describe('decodeCbor specific functionality', () => {
    it('should handle Uint8Array input for decoding', () => {
      const data = { test: 'data' };
      const encoded = encodeCbor(data);
      const decoded = decodeCbor(encoded);
      expect(decoded).toEqual(new Map([['test', 'data']]));
    });
  });

  describe('Tag 24 decoding without Tag class on encode', () => {
    it('should decode Tag24 wrapping number 123 into Tag with embedded CBOR bytes', () => {
      // Tag 24 (embedded CBOR) wrapping inner CBOR for number 123
      // Inner CBOR for 123: 0x18 0x7b
      // Full encoded: d8 18 42 18 7b
      const raw = new Uint8Array([0xd8, 0x18, 0x42, 0x18, 0x7b]);

      const decoded = decodeCbor(raw) as Tag;

      expect(decoded).toBeInstanceOf(Tag);
      expect(decoded.tag).toBe(24);
      expect(decoded.value).toBeInstanceOf(Uint8Array);
      expect(decoded.value).toEqual(new Uint8Array([0x18, 0x7b]));
    });

    it('should decode Tag24 wrapping string "hello" into Tag with embedded CBOR bytes', () => {
      // Tag 24 (embedded CBOR) wrapping inner CBOR for text string "hello"
      // Inner CBOR for "hello": 0x65 68 65 6c 6c 6f
      // Full encoded: d8 18 46 65 68 65 6c 6c 6f
      const raw = new Uint8Array([
        0xd8, 0x18, 0x46, 0x65, 0x68, 0x65, 0x6c, 0x6c, 0x6f,
      ]);

      const decoded = decodeCbor(raw) as Tag;

      expect(decoded).toBeInstanceOf(Tag);
      expect(decoded.tag).toBe(24);
      expect(decoded.value).toBeInstanceOf(Uint8Array);
      expect(decoded.value).toEqual(
        new Uint8Array([0x65, 0x68, 0x65, 0x6c, 0x6c, 0x6f])
      );
    });
  });

  describe('Tag 24 encoding binary equality', () => {
    it('should produce identical binary for Tag(123, 24) and direct Tag24 bytes', () => {
      const fromTag = encodeCbor(new Tag(encodeCbor(123), 24));
      const direct = new Uint8Array([0xd8, 0x18, 0x42, 0x18, 0x7b]);

      expect(fromTag).toEqual(direct);
    });
  });

  describe('defaultOptions', () => {
    it('should have correct default values', () => {
      expect(defaultOptions.tagUint8Array).toBe(false);
      expect(defaultOptions.useRecords).toBe(false);
      expect(defaultOptions.mapsAsObjects).toBe(false);
      expect(defaultOptions.useTag259ForMaps).toBe(false);
    });

    it('should be compatible with AdvancedOptions type', () => {
      const options: AdvancedOptions = defaultOptions;
      expect(options).toBeDefined();
      expect(typeof options.useTag259ForMaps).toBe('boolean');
    });
  });
});
