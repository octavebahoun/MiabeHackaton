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
var NotificationsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
let NotificationsProcessor = NotificationsProcessor_1 = class NotificationsProcessor {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationsProcessor_1.name);
    }
    async handleSendSms(job) {
        this.logger.debug(`[Job ${job.id}] Début du traitement de l'envoi SMS`);
        const payload = job.data.payload;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        const fromPhone = this.configService.get('TWILIO_PHONE_NUMBER');
        if (!accountSid || !authToken || !fromPhone) {
            this.logger.log(`[STUB SMS] Config Twilio absente. Message pour ${payload.to}: "${payload.message}"`);
            return;
        }
        try {
            const twilio = require('twilio');
            const client = twilio(accountSid, authToken);
            const message = await client.messages.create({
                body: payload.message,
                from: fromPhone,
                to: payload.to,
            });
            this.logger.log(`[REAL SMS] Envoyé à ${payload.to} via Twilio (SID: ${message.sid})`);
        }
        catch (error) {
            this.logger.error(`[Twilio Error] Echec de l'envoi SMS à ${payload.to}: ${error.message}`);
            throw error;
        }
        this.logger.debug(`[Job ${job.id}] SMS traité avec succès`);
    }
    async handleSendPush(job) {
        this.logger.debug(`[Job ${job.id}] Début du traitement de la notification Push`);
        const payload = job.data.payload;
        try {
            if (admin.apps.length > 0) {
                await admin.messaging().send({
                    token: payload.token,
                    notification: {
                        title: payload.title,
                        body: payload.body,
                    },
                });
                this.logger.log(`[Push FCM] Notification envoyée: "${payload.title}"`);
            }
            else {
                this.logger.warn(`[STUB Push FCM] Firebase n'est pas initialisé. Titre: "${payload.title}"`);
            }
        }
        catch (error) {
            this.logger.error(`[Push FCM] Erreur lors de l'envoi: ${error.message}`);
            throw error;
        }
        this.logger.debug(`[Job ${job.id}] Push traité avec succès`);
    }
};
exports.NotificationsProcessor = NotificationsProcessor;
__decorate([
    (0, bull_1.Process)('send-sms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsProcessor.prototype, "handleSendSms", null);
__decorate([
    (0, bull_1.Process)('send-push'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsProcessor.prototype, "handleSendPush", null);
exports.NotificationsProcessor = NotificationsProcessor = NotificationsProcessor_1 = __decorate([
    (0, bull_1.Processor)('notifications-queue'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsProcessor);
//# sourceMappingURL=notifications.processor.js.map