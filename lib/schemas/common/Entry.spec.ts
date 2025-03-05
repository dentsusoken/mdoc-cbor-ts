import { describe, expect, it } from 'vitest';
import type { Entry } from './Entry';

describe('Entry', () => {
  it('should correctly type entries from a record', () => {
    type TestRecord = {
      name: string;
      age: number;
      isActive: boolean;
    };

    // TypeScript type checking
    const entries: Entry<TestRecord>[] = [
      ['name', 'John'],
      ['age', 30],
      ['isActive', true],
    ];

    // Runtime validation
    expect(entries).toHaveLength(3);
    expect(entries[0]).toEqual(['name', 'John']);
    expect(entries[1]).toEqual(['age', 30]);
    expect(entries[2]).toEqual(['isActive', true]);
  });

  it('should handle empty record type', () => {
    type EmptyRecord = Record<string, never>;
    type EmptyEntry = Entry<EmptyRecord>;

    // TypeScript type checking
    const entries: EmptyEntry[] = [];

    // Runtime validation
    expect(entries).toHaveLength(0);
  });
});
