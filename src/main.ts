import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // permitir body grande (para fotoBase64 u otros adjuntos)
  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }))

  const PROD_FRONT = 'https://visitasfront-production.up.railway.app'
  const LOCAL_FRONT_1 = 'http://localhost:3002'
  const LOCAL_FRONT_2 = 'http://127.0.0.1:3002'

  app.enableCors({
    origin: [PROD_FRONT, LOCAL_FRONT_1, LOCAL_FRONT_2],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })

  const port = Number(process.env.PORT ?? 3001)
  await app.listen(port)
  console.log(`Clientes/Visitas API escuchando en puerto ${port}`)
}

bootstrap()
