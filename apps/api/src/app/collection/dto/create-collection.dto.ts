import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateCollectionRequest } from '@harbor-play-media/shared-api';

export class CreateCollectionDto implements CreateCollectionRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
