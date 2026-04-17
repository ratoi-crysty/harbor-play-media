import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaEntity } from './media.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaMetadataService } from './media-metadata.service';
import { ShareModule } from '../share/share.module';
import { CollectionModule } from '../collection/collection.module';

@Module({
  imports: [TypeOrmModule.forFeature([MediaEntity]), ShareModule, CollectionModule],
  controllers: [MediaController],
  providers: [MediaService, MediaMetadataService],
  exports: [MediaService],
})
export class MediaModule {}
