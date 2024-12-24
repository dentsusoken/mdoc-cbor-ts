import { Sign1 } from '@auth0/cose';
import { NameSpace } from '../../schemas';

export interface MsoIssueHandler {
  issue(data: NameSpace, validFrom?: Date): Promise<Sign1>;
}
