export enum ShareResourceType {
  MEDIA = 'media',
  COLLECTION = 'collection',
}

export enum SharePermission {
  VIEW_DOWNLOAD = 'view_download',
}

export interface ShareModel {
  id: string;
  resourceType: ShareResourceType;
  resourceId: string;
  sharedWithUserId: number;
  sharedWithUserEmail: string;
  sharedWithUserName: string;
  sharedByUserId: number;
  permission: SharePermission;
  createdAt: string;
}
