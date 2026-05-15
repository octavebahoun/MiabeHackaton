# TontineChain Backend

> Plateforme de tontines blockchain — MIABE Hackathon 2026 — Bénin

## Stack technique
- **Backend** : NestJS (Node.js 20) + TypeScript
- **Base de données** : PostgreSQL 16
- **Cache / Queue** : Redis 7 + BullMQ
- **Blockchain** : Polygon PoS (Mumbai testnet) via ethers.js v6
- **Smart Contracts** : Solidity 0.8 + OpenZeppelin
- **Paiements** : CinetPay (MTN MoMo / Moov Money)
- **Auth** : JWT RS256 + Argon2id
- **Infra** : Docker Compose + Nginx

## Arborescence du projet

```
tontinechain-backend/
├── contracts/                          # Smart contracts Solidity
│   ├── TontineRegistry.sol             # Registre global des vaults
│   └── TontineVault.sol                # Logique principale par tontine
├── scripts/
│   └── deploy.ts                       # Script de déploiement Hardhat
├── nginx/
│   └── nginx.conf                      # Reverse proxy TLS
├── keys/                               # Clés RSA JWT (non versionnées)
├── src/
│   ├── main.ts                         # Bootstrap NestJS
│   ├── app.module.ts                   # Module racine
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── blockchain.config.ts
│   │   └── jwt.config.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts      # @Roles()
│   │   │   ├── current-user.decorator.ts # @CurrentUser()
│   │   │   └── public.decorator.ts     # @Public()
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── tontine-owner.guard.ts
│   │   ├── interceptors/
│   │   │   ├── response-transform.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── middleware/
│   │   │   ├── request-id.middleware.ts
│   │   │   └── logger.middleware.ts
│   │   └── utils/
│   │       ├── crypto.util.ts
│   │       └── pagination.util.ts
│   └── modules/
│       ├── auth/                       # Inscription, OTP, login, logout
│       ├── users/                      # Profil, score fiabilité
│       ├── tontines/                   # CRUD tontines, membres
│       ├── cycles/                     # Périodes de collecte
│       ├── contributions/              # Cotisations + webhook CinetPay
│       ├── payments/                   # Adaptateur CinetPay
│       ├── blockchain/                 # Polygon, preuves on-chain, workers
│       ├── wallets/                    # Wallets custodial Polygon
│       ├── notifications/              # SMS, push FCM, templates
│       ├── score/                      # Score de fiabilité financière
│       ├── sanctions/                  # Retards et pénalités (Phase 1)
│       ├── admin/                      # Dashboard admin (Phase 1)
│       └── health/                     # GET /health
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

## Installation rapide

```bash
# 1. Cloner et installer
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Remplir les valeurs dans .env

# 3. Générer les clés RSA JWT
openssl genpkey -algorithm RSA -out keys/jwt-private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -in keys/jwt-private.pem -pubout -out keys/jwt-public.pem

# 4. Démarrer les services Docker
docker-compose up -d postgres redis

# 5. Lancer le backend en développement
npm run start:dev

# 6. Compiler et déployer les smart contracts
npm run chain:compile
npm run chain:deploy
```

## API Documentation
Swagger disponible sur : `http://localhost:3000/api/docs`

## Workflow de démo (3 minutes)
1. `POST /auth/register` → inscription téléphone
2. `POST /auth/verify-otp` → activation compte
3. `POST /tontines` → créer une tontine
4. `POST /tontines/:id/join` → rejoindre (autre user)
5. `POST /tontines/:id/start` → démarrer + déploiement smart contract
6. `POST /contributions/initiate` → cotisation Mobile Money
7. `GET /blockchain/tontine/:id` → preuve on-chain visible ✅

## Priorités MVP Hackathon
- ✅ Pipeline paiement bout-en-bout (CinetPay sandbox)
- ✅ Idempotence stricte (UNIQUE INDEX + Redis SETNX)
- ✅ Smart contract sur Mumbai testnet
- ✅ API Swagger documentée
- ✅ Démo en 3 minutes

---
*TontineChain — MIABE Hackathon 2026 — Confidentiel*
