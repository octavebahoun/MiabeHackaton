import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { KycStatus } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly usersService: UsersService) {}

  async verifyKyc(userId: string): Promise<void> {
    this.logger.log(`Admin - Validation KYC pour user ${userId}`);
    await this.usersService.updateKycStatus(userId, KycStatus.VERIFIED);
  }

  async blockUser(userId: string): Promise<void> {
    this.logger.log(`Admin - Blocage de l'utilisateur ${userId}`);
    await this.usersService.blockUser(userId);
  }
}
