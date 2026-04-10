import { IsArray, IsOptional, IsString } from 'class-validator';
import { UpdateMediaRequest } from '@harbor-play-media/shared-api';

export class UpdateMediaDto implements UpdateMediaRequest {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
