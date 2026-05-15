import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from '@nestjs-modules/ioredis';

// Modules fonctionnels
import { AuthModule }           from './modules/auth/auth.module';
import { UsersModule }          from './modules/users/users.module';
import { TontinesModule }       from './modules/tontines/tontines.module';
import { ContributionsModule }  from './modules/contributions/contributions.module';
import { PaymentsModule }       from './modules/payments/payments.module';
import { WalletsModule }        from './modules/wallets/wallets.module';
import { HealthModule }         from './modules/health/health.module';
import { BlockchainModule }     from './modules/blockchain/blockchain.module';
import { CyclesModule }         from './modules/cycles/cycles.module';
import { NotificationsModule }  from './modules/notifications/notifications.module';
import { AdminModule }          from './modules/admin/admin.module';
import { ScoreModule }          from './modules/score/score.module';
import { SanctionsModule }      from './modules/sanctions/sanctions.module';

// Entités TypeORM
import { User }                 from './modules/users/entities/user.entity';
import { Wallet }               from './modules/wallets/entities/wallet.entity';
import { Tontine }              from './modules/tontines/entities/tontine.entity';
import { TontineMember }        from './modules/tontines/entities/tontine-member.entity';
import { Contribution }         from './modules/contributions/entities/contribution.entity';
import { Cycle }                from './modules/cycles/entities/cycle.entity';

@Module({
  imports: [
    // 1. Variables d'environnement (global = accessible partout)
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // 2. PostgreSQL via TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get<string>('DB_HOST', 'localhost'),
        port:     config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'tontinechain'),
        entities: [User, Wallet, Tontine, TontineMember, Contribution, Cycle],
        synchronize: config.get<string>('NODE_ENV') !== 'production', // OFF en prod !
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    // 3. Redis via @nestjs-modules/ioredis (fournit @InjectRedis() global)
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: `redis://${config.get('REDIS_HOST', 'localhost')}:${config.get('REDIS_PORT', 6379)}`,
        options: {
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),

    // 4. BullMQ / Bull (queues asynchrones)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host:     config.get<string>('REDIS_HOST', 'localhost'),
          port:     config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),

    // 5. Rate Limiting (20 req/min)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),

    // 5. Modules métier
    AuthModule,
    UsersModule,
    TontinesModule,
    ContributionsModule,
    PaymentsModule,
    WalletsModule,
    BlockchainModule,
    CyclesModule,
    HealthModule,
    NotificationsModule,
    AdminModule,
    ScoreModule,
    SanctionsModule,
  ],
  providers: [
    // Protection globale Rate Limit
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
