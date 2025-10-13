import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // opcional según tu frontend

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`Clientes/Visitas API listening on http://localhost:${port}`);
}
bootstrap();
