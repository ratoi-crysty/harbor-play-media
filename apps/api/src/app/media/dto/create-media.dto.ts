import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateMediaRequest } from '@harbor-play-media/shared-api';

export class CreateMediaDto implements CreateMediaRequest {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  collectionId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') return JSON.parse(value) as string[];
    return value;
  })
  tags?: string[];
}
