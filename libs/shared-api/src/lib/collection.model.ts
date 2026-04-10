export interface CollectionModel {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  parentId: string | undefined;
  ownerId: number;
  createdAt: string;
  itemCount: number;
}
