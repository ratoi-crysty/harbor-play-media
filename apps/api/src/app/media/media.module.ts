import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaEntity } from './media.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaMetadataService } from './media-metadata.service';
import { ShareModule } from '../share/share.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaEntity]),
    forwardRef(() => ShareModule),
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaMetadataService],
  exports: [MediaService],
})
export class MediaModule {}
