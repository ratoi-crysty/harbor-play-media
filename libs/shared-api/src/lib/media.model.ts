export interface MediaModel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  url: string;
  duration: number; // seconds
  fileSize: number; // bytes
  mimeType: string;
  resolution?: string;
  createdAt: string;
  viewCount: number;
  uploadedByUserId?: number;
  uploadedByUserName?: string;
  collectionId?: string;
  tags: string[];
}
