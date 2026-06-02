// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'https://tu-frontend-desplegado.railway.app', // Reemplaza con la URL de tu frontend tras desplegarlo
    credentials: true,
  });
  // Railway asigna el puerto mediante la variable de entorno PORT. Usa el puerto 3000 como fallback para desarrollo local.
  await app.listen(process.env.PORT || 3000);
}
bootstrap();