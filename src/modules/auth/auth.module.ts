import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { WalletsModule } from '../wallets/wallets.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => WalletsModule),
    PassportModule,
    BullModule.registerQueue({
      name: 'notifications-queue',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const privateKeyPath = configService.get<string>('JWT_PRIVATE_KEY_PATH');
        const publicKeyPath = configService.get<string>('JWT_PUBLIC_KEY_PATH');
        
        let privateKey = '';
        let publicKey = '';
        
        try {
          privateKey = fs.readFileSync(path.resolve(process.cwd(), privateKeyPath), 'utf8');
          publicKey = fs.readFileSync(path.resolve(process.cwd(), publicKeyPath), 'utf8');
        } catch(e) {
            console.warn('Could not read JWT keys. Using dummy keys for module initialization.');
            privateKey = 'DUMMY_PRIVATE';
            publicKey = 'DUMMY_PUBLIC';
        }

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
