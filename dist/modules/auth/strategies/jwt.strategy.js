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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../users/users.service");
const ioredis_1 = require("@nestjs-modules/ioredis");
const ioredis_2 = __importDefault(require("ioredis"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, usersService, redis) {
        const publicKeyPath = configService.get('JWT_PUBLIC_KEY_PATH');
        let publicKey = '';
        try {
            publicKey = fs.readFileSync(path.resolve(process.cwd(), publicKeyPath), 'utf8');
        }
        catch (e) {
            console.warn('Could not read JWT_PUBLIC_KEY_PATH, using dummy key for startup');
            publicKey = 'DUMMY_KEY';
        }
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: publicKey,
            algorithms: ['RS256'],
            passReqToCallback: true,
        });
        this.configService = configService;
        this.usersService = usersService;
        this.redis = redis;
    }
    async validate(req, payload) {
        const token = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        const isBlacklisted = await this.redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            throw new common_1.UnauthorizedException('Token révoqué');
        }
        const user = await this.usersService.findById(payload.sub);
        if (!user || !user.is_active) {
            throw new common_1.UnauthorizedException('Utilisateur inactif ou introuvable');
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, ioredis_1.InjectRedis)()),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService,
        ioredis_2.default])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map