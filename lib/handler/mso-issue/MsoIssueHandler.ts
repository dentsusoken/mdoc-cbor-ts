import { Sign1 } from '@auth0/cose';
import { RawNameSpaces } from '../../schemas';

export interface MsoIssueHandler {
  issue(data: RawNameSpaces, validFrom?: Date): Promise<Sign1>;
}
