# ============================================================
# Dockerfile — TontineChain Backend (Production)
# ============================================================

# ── STAGE 1 : Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

# Dépendances système pour argon2 (module natif C++)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Compiler TypeScript → JavaScript
RUN npm run build

# Debug: vérifier que le fichier main.js existe bien
RUN ls -la /app/dist/ && echo "✅ Build OK" || (echo "❌ dist/ vide !" && exit 1)
RUN test -f /app/dist/main.js && echo "✅ dist/main.js trouvé" || (echo "❌ dist/main.js MANQUANT" && find /app/dist -name "main.js" && exit 1)

# ── STAGE 2 : Runner ─────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libssl3 dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nestjs -u 1001 -G nodejs

WORKDIR /app

# Copier uniquement les fichiers nécessaires au runtime
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist         ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

RUN mkdir -p /app/keys && chown nestjs:nodejs /app/keys

USER nestjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
