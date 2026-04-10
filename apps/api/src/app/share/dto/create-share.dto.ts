import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CreateShareRequest, ShareResourceType } from '@harbor-play-media/shared-api';

export class CreateShareDto implements CreateShareRequest {
  @IsEnum(ShareResourceType)
  resourceType!: ShareResourceType;

  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @IsEmail()
  email!: string;
}
