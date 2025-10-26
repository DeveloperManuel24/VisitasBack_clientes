// src/main.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // permitir body grande (para fotoBase64 u otros adjuntos)
  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }))

  // CORS:
  // - Permitimos el frontend público (FRONTEND_URL)
  // - Permitimos localhost:3002 para pruebas locales
  // - Permitimos '*' como red de seguridad por ahora
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002'

  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3002', 'http://127.0.0.1:3002', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  const port = Number(process.env.PORT ?? 3001)
  await app.listen(port)
  console.log(`Clientes/Visitas API escuchando en puerto ${port}`)
}

bootstrap()
