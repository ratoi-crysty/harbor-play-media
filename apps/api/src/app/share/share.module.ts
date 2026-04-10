import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@auth-lib/nest';
import { ShareEntity } from './share.entity';
import { CollectionEntity } from '../collection/collection.entity';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShareEntity, CollectionEntity]),
    UserModule,
  ],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
