import { describe, it, expect, vi } from 'vitest';
import { DocumentData } from './DocumentGenerator';
import { MsoIssueHandler } from '../mso-issue';
import { MdocIssueHandlerImpl } from './MdocIssueHandlerImpl';
import { NameSpacesGenerator } from './NameSpacesGenerator';
import { DocumentsGenerator } from './DocumentGenerator';

describe('MdocIssueHandlerImpl', () => {
  const mockMsoIssueHandler: MsoIssueHandler = {
    issue: vi.fn().mockResolvedValue({}),
  };

  const mockNameSpacesGenerator: NameSpacesGenerator = vi
    .fn()
    .mockReturnValue({});
  const mockDocumentsGenerator: DocumentsGenerator = vi
    .fn()
    .mockResolvedValue([]);

  const mdocIssuerConfig = {
    SALT_LENGTH: 16,
  };

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const handler = new MdocIssueHandlerImpl(
        mockMsoIssueHandler,
        mdocIssuerConfig
      );
      expect(handler).toBeInstanceOf(MdocIssueHandlerImpl);
    });

    it('should create instance with custom generators', () => {
      const handler = new MdocIssueHandlerImpl(
        mockMsoIssueHandler,
        mdocIssuerConfig,
        {
          nameSpacesGenerator: mockNameSpacesGenerator,
          documentsGenerator: mockDocumentsGenerator,
        }
      );
      expect(handler).toBeInstanceOf(MdocIssueHandlerImpl);
    });
  });

  describe('issue', () => {
    let handler: MdocIssueHandlerImpl;

    beforeEach(() => {
      handler = new MdocIssueHandlerImpl(
        mockMsoIssueHandler,
        mdocIssuerConfig,
        {
          documentsGenerator: mockDocumentsGenerator,
        }
      );
    });

    it('should issue mdoc document with raw encoding', async () => {
      const inputData: Record<string, Record<string, unknown>> = {
        org: { name: 'Test Org' },
      };

      const result = await handler.issue(inputData, 'mdoc', 'raw');
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(mockDocumentsGenerator).toHaveBeenCalledWith([
        { docType: 'mdoc', data: inputData },
      ]);
    });

    it('should issue mdoc document with hex encoding', async () => {
      const inputData: Record<string, Record<string, unknown>> = {
        org: { name: 'Test Org' },
      };
      const result = await handler.issue(inputData, 'mdoc', 'hex');
      expect(typeof result).toBe('string');
    });

    it('should issue mdoc document with base64 encoding', async () => {
      const inputData: Record<string, Record<string, unknown>> = {
        org: { name: 'Test Org' },
      };
      const result = await handler.issue(inputData, 'mdoc', 'base64');
      expect(typeof result).toBe('string');
    });

    it('should issue mdoc document with base64url encoding', async () => {
      const inputData: Record<string, Record<string, unknown>> = {
        org: { name: 'Test Org' },
      };
      const result = await handler.issue(inputData, 'mdoc', 'base64url');
      expect(typeof result).toBe('string');
    });

    it('should handle array of document data', async () => {
      const inputData: DocumentData[] = [
        {
          docType: 'mdoc1',
          data: { field1: { value: 'value1' } },
        },
        {
          docType: 'mdoc2',
          data: { field2: { value: 'value2' } },
        },
      ];

      const result = await handler.issue(inputData, 'mdoc', 'raw');
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(mockDocumentsGenerator).toHaveBeenCalledWith(inputData);
    });
  });
});
