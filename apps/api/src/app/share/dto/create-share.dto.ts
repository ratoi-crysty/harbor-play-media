import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ShareResourceType } from '@harbor-play-media/shared-api';

export class CreateShareDto {
  @IsEnum(ShareResourceType)
  resourceType!: ShareResourceType;

  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @IsEmail()
  email!: string;
}
