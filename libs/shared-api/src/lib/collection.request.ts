export interface CreateCollectionRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
}

export interface MoveCollectionRequest {
  parentId: string | undefined;
}
