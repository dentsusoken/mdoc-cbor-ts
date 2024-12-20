import { NameSpace } from '../../schemas';
import { Buffer } from 'node:buffer';

export interface MsoIssueHandler {
  issue(data: NameSpace, validFrom?: Date): Promise<Buffer>;
}
