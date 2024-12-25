import { describe, it, expect, vi } from 'vitest';
import {
  createDefaultDocumentsGenerator,
  DocumentData,
} from './DocumentGenerator';
import { MsoIssueHandler } from '../mso-issue';
import { NameSpacesGenerator } from './NameSpacesGenerator';

describe('DocumentGenerator', () => {
  const mockMsoIssueHandler: MsoIssueHandler = {
    issue: vi.fn().mockResolvedValue({
      encode: vi.fn().mockReturnValue(Buffer.from('test')),
    }),
  };

  const mockNameSpacesGenerator: NameSpacesGenerator = vi
    .fn()
    .mockResolvedValue({
      raw: { org: [] },
      encoded: { org: [] },
    });

  const documentsGenerator = createDefaultDocumentsGenerator(
    mockMsoIssueHandler,
    mockNameSpacesGenerator
  );

  it('should generate documents from input data', async () => {
    const inputData: DocumentData[] = [
      {
        docType: 'mdoc',
        data: {
          org: {
            name: 'Test Org',
          },
        },
      },
    ];

    const result = await documentsGenerator(inputData);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      docType: 'mdoc',
      issuerSigned: {
        nameSpaces: { org: [] },
        issuerAuth: Buffer.from('test'),
      },
      deviceSigned: {},
    });

    expect(mockNameSpacesGenerator).toHaveBeenCalledWith(inputData[0].data);
    expect(mockMsoIssueHandler.issue).toHaveBeenCalled();
  });

  it('should handle empty input array', async () => {
    const result = await documentsGenerator([]);
    expect(result).toEqual([]);
  });
});
