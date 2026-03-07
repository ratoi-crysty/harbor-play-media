import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationEntity } from './invitation.entity';
import { InvitationService } from './invitation.service';
import { UserModule } from '../user';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationEntity]), UserModule],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
