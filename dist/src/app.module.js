"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const tontines_module_1 = require("./modules/tontines/tontines.module");
const contributions_module_1 = require("./modules/contributions/contributions.module");
const payments_module_1 = require("./modules/payments/payments.module");
const wallets_module_1 = require("./modules/wallets/wallets.module");
const health_module_1 = require("./modules/health/health.module");
const blockchain_module_1 = require("./modules/blockchain/blockchain.module");
const cycles_module_1 = require("./modules/cycles/cycles.module");
const user_entity_1 = require("./modules/users/entities/user.entity");
const wallet_entity_1 = require("./modules/wallets/entities/wallet.entity");
const tontine_entity_1 = require("./modules/tontines/entities/tontine.entity");
const tontine_member_entity_1 = require("./modules/tontines/entities/tontine-member.entity");
const contribution_entity_1 = require("./modules/contributions/entities/contribution.entity");
const cycle_entity_1 = require("./modules/cycles/entities/cycle.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 5432),
                    username: config.get('DB_USERNAME', 'postgres'),
                    password: config.get('DB_PASSWORD', 'postgres'),
                    database: config.get('DB_DATABASE', 'tontinechain'),
                    entities: [user_entity_1.User, wallet_entity_1.Wallet, tontine_entity_1.Tontine, tontine_member_entity_1.TontineMember, contribution_entity_1.Contribution, cycle_entity_1.Cycle],
                    synchronize: config.get('NODE_ENV') !== 'production',
                    logging: config.get('NODE_ENV') === 'development',
                }),
            }),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    redis: {
                        host: config.get('REDIS_HOST', 'localhost'),
                        port: config.get('REDIS_PORT', 6379),
                        password: config.get('REDIS_PASSWORD') || undefined,
                    },
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            tontines_module_1.TontinesModule,
            contributions_module_1.ContributionsModule,
            payments_module_1.PaymentsModule,
            wallets_module_1.WalletsModule,
            blockchain_module_1.BlockchainModule,
            cycles_module_1.CyclesModule,
            health_module_1.HealthModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map