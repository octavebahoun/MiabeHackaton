# ============================================================
# Dockerfile — TontineChain Backend (Production)
# Build multi-stage optimisé pour Railway
# ============================================================

# ── STAGE 1 : Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

# Dépendances système pour argon2 (compilation native)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier les manifestes de dépendances en premier (cache Docker efficace)
COPY package*.json ./

# Installer TOUTES les dépendances (dev + prod) pour le build
RUN npm ci

# Copier tout le code source
COPY . .

# Compiler TypeScript → JavaScript
RUN npm run build

# ── STAGE 2 : Runner (image finale légère) ───────────────────
FROM node:20-alpine AS runner

# Dépendances système runtime (argon2 a besoin de libssl)
RUN apk add --no-cache libssl3 dumb-init

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nestjs -u 1001 -G nodejs

WORKDIR /app

# Copier uniquement les dépendances de PRODUCTION depuis le builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist         ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Copier les fichiers de configuration statiques nécessaires au runtime
# Les ABIs des contrats sont lus depuis le filesystem au démarrage
COPY --from=builder --chown=nestjs:nodejs /app/src/modules/blockchain/contracts ./dist/modules/blockchain/contracts

# Créer le dossier des clés JWT (sera monté via les Variables Railway)
RUN mkdir -p /app/keys && chown nestjs:nodejs /app/keys

# Passer à l'utilisateur non-root
USER nestjs

# Railway expose automatiquement le port via la variable PORT
EXPOSE 3000

# dumb-init gère les signaux OS correctement (SIGTERM propre)
ENTRYPOINT ["dumb-init", "--"]

# Démarrer l'application en mode production
CMD ["node", "dist/main"]
