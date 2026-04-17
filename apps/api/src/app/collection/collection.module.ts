import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionEntity } from './collection.entity';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { ShareModule } from '../share/share.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionEntity]),
    ShareModule,
  ],
  controllers: [CollectionController],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}
