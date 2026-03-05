import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { MoreThan, Repository } from 'typeorm';
import { UserEntity } from '../user';
import { InvitationEntity } from './invitation.entity';

export interface CreateInvitationOptions {
  email: string;
  createdBy: UserEntity;
  expiryDays: number;
}

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(InvitationEntity)
    private readonly invitationRepository: Repository<InvitationEntity>
  ) {}

  async create(options: CreateInvitationOptions): Promise<InvitationEntity> {
    const token: string = randomBytes(32).toString('hex');
    const expiresAt: Date = new Date();
    expiresAt.setDate(expiresAt.getDate() + options.expiryDays);

    const invitation: InvitationEntity = this.invitationRepository.create({
      token,
      email: options.email.toLowerCase(),
      createdBy: options.createdBy,
      createdById: options.createdBy.id,
      expiresAt,
    });

    return this.invitationRepository.save(invitation);
  }

  async findByToken(token: string): Promise<InvitationEntity | null> {
    return this.invitationRepository.findOne({
      where: { token },
      relations: ['createdBy'],
    });
  }

  async findValidByTokenAndEmail(
    token: string,
    email: string
  ): Promise<InvitationEntity | null> {
    return this.invitationRepository.findOne({
      where: {
        token,
        email: email.toLowerCase(),
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async markAsUsed(id: number): Promise<void> {
    await this.invitationRepository.update(id, { used: true });
  }

  async findAll(): Promise<InvitationEntity[]> {
    return this.invitationRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<InvitationEntity | null> {
    return this.invitationRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.invitationRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByEmail(email: string): Promise<InvitationEntity | null> {
    return this.invitationRepository.findOne({
      where: { email: email.toLowerCase(), used: false },
      relations: ['createdBy'],
    });
  }
}
