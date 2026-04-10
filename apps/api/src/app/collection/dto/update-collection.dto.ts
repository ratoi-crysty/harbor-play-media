import { IsOptional, IsString } from 'class-validator';
import { UpdateCollectionRequest } from '@harbor-play-media/shared-api';

export class UpdateCollectionDto implements UpdateCollectionRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
