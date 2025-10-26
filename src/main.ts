import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // permitir body grande (para fotoBase64 en requests)
  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }))

  app.enableCors({
    origin: 'http://localhost:3002',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  const port = Number(process.env.PORT ?? 3001)
  await app.listen(port)
  console.log(`Clientes/Visitas API listening on http://localhost:${port}`)
}

bootstrap()
