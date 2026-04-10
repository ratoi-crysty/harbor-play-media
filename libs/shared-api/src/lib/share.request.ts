import { ShareResourceType } from './share.model';

export interface CreateShareRequest {
  resourceType: ShareResourceType;
  resourceId: string;
  email: string;
}
