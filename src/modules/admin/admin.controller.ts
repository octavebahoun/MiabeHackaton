import { Controller, Post, Param, UseGuards, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// Import roles guard here when created
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';
// import { UserRole } from '../users/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard /*, RolesGuard*/)
// @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('users/:id/kyc-verify')
  async verifyKyc(@Param('id') userId: string) {
    await this.adminService.verifyKyc(userId);
    return { message: 'KYC_VERIFIED' };
  }

  @Patch('users/:id/block')
  async blockUser(@Param('id') userId: string) {
    await this.adminService.blockUser(userId);
    return { message: 'USER_BLOCKED' };
  }
}
