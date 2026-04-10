export interface CreateMediaRequest {
  title: string;
  description?: string;
  collectionId?: string;
  tags?: string[];
}

export interface UpdateMediaRequest {
  title?: string;
  description?: string;
  tags?: string[];
}
