import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionEntity } from './collection.entity';
import { MediaEntity } from '../media/media.entity';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { ShareModule } from '../share/share.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionEntity, MediaEntity]),
    forwardRef(() => ShareModule),
  ],
  controllers: [CollectionController],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}
