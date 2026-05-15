"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const users_module_1 = require("../users/users.module");
const wallets_module_1 = require("../wallets/wallets.module");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const local_strategy_1 = require("./strategies/local.strategy");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            (0, common_1.forwardRef)(() => wallets_module_1.WalletsModule),
            passport_1.PassportModule,
            bull_1.BullModule.registerQueue({
                name: 'notifications-queue',
            }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    let privateKey = '';
                    let publicKey = '';
                    const envPrivateKey = configService.get('JWT_PRIVATE_KEY');
                    const envPublicKey = configService.get('JWT_PUBLIC_KEY');
                    if (envPrivateKey && envPublicKey) {
                        privateKey = envPrivateKey.replace(/\\n/g, '\n');
                        publicKey = envPublicKey.replace(/\\n/g, '\n');
                    }
                    else {
                        try {
                            const privateKeyPath = configService.get('JWT_PRIVATE_KEY_PATH');
                            const publicKeyPath = configService.get('JWT_PUBLIC_KEY_PATH');
                            privateKey = fs.readFileSync(path.resolve(process.cwd(), privateKeyPath), 'utf8');
                            publicKey = fs.readFileSync(path.resolve(process.cwd(), publicKeyPath), 'utf8');
                        }
                        catch (e) {
                            console.warn('⚠️  Clés JWT introuvables. Générer avec : npm run keys:generate');
                            privateKey = 'DUMMY_PRIVATE';
                            publicKey = 'DUMMY_PUBLIC';
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
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, local_strategy_1.LocalStrategy, jwt_strategy_1.JwtStrategy],
        exports: [auth_service_1.AuthService, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map