import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCollectionDto {
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
