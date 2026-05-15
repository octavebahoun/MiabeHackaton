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
        let privateKey = '';
        let publicKey = '';

        // Stratégie 1 : Variables d'env directes (Railway, Docker, CI/CD)
        const envPrivateKey = configService.get<string>('JWT_PRIVATE_KEY');
        const envPublicKey  = configService.get<string>('JWT_PUBLIC_KEY');

        if (envPrivateKey && envPublicKey) {
          // Railway stocke les clés PEM avec des \n littéraux — on les restaure
          privateKey = envPrivateKey.replace(/\\n/g, '\n');
          publicKey  = envPublicKey.replace(/\\n/g, '\n');
        } else {
          // Stratégie 2 : Fichiers PEM locaux (développement)
          try {
            const privateKeyPath = configService.get<string>('JWT_PRIVATE_KEY_PATH');
            const publicKeyPath  = configService.get<string>('JWT_PUBLIC_KEY_PATH');
            privateKey = fs.readFileSync(path.resolve(process.cwd(), privateKeyPath), 'utf8');
            publicKey  = fs.readFileSync(path.resolve(process.cwd(), publicKeyPath),  'utf8');
          } catch (e) {
            console.warn('⚠️  Clés JWT introuvables. Générer avec : npm run keys:generate');
            privateKey = 'DUMMY_PRIVATE';
            publicKey  = 'DUMMY_PUBLIC';
          }
        }

        return {
          privateKey,
          publicKey,
          signOptions: { algorithm: 'RS256' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
