import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe }        from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';

import { AppModule }    from './app.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // rawBody nécessaire pour la vérification de signature HMAC du webhook FedaPay
    rawBody: true,
  });

  // ── Sécurité HTTP ──────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // ── Validation globale (class-validator) ──────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Supprime les champs non déclarés dans le DTO
    forbidNonWhitelisted: true,
    transform: true,        // Convertit les types automatiquement (ex: string → number)
  }));

  // ── JWT Guard global (toutes routes protégées sauf @Public()) ────────────
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // ── Préfixe global de l'API ───────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger / OpenAPI ─────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('TontineChain API')
    .setDescription('API Backend pour la plateforme de tontines blockchain — MIABE Hackathon 2026')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ── Démarrage ─────────────────────────────────────────────────────────────
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 TontineChain Backend démarré sur http://localhost:${port}`);
  console.log(`📚 Swagger disponible sur  http://localhost:${port}/api/docs\n`);
}

bootstrap();
