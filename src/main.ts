import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // permitir JSON grande (fotos base64, etc.)
  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }))

  // Dominios permitidos:
  // - PROD_FRONT: tu Next.js desplegado en Railway (frontend público)
  // - LOCAL_FRONT_1 / LOCAL_FRONT_2: desarrollo local
  const PROD_FRONT = 'https://visitasfront-production.up.railway.app'
  const LOCAL_FRONT_1 = 'http://localhost:3002'
  const LOCAL_FRONT_2 = 'http://127.0.0.1:3002'

  app.enableCors({
    origin: [PROD_FRONT, LOCAL_FRONT_1, LOCAL_FRONT_2],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // no usamos cookies/sesiones, solo Bearer JWT => false
  })

  // IMPORTANTE:
  // Railway te inyecta PORT. Local usás 3001.
  const port = Number(process.env.PORT ?? 3001)

  await app.listen(port)
  console.log(`Clientes/Visitas API listening on http://localhost:${port}`)
}

bootstrap()
