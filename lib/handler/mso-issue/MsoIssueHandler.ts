import { Sign1 } from '@auth0/cose';
import { EncodedNameSpaces } from '../../schemas';

export interface MsoIssueHandler {
  issue(data: EncodedNameSpaces, validFrom?: Date): Promise<Sign1>;
}
