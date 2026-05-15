# ============================================================
# Dockerfile — Image Docker pour le backend NestJS TontineChain
#
# Stratégie multi-stage :
#   Stage 1 (builder) : compile le TypeScript → dist/
#   Stage 2 (runner)  : image légère node:20-alpine,
#                       copie uniquement dist/ + node_modules prod
# Ports exposés : 3000
# ============================================================
