// src/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ClientesModule } from './clientes/clientes.module'
import { VisitasModule } from './visitas/visitas.module'
import { GmailModule } from './gmail/gmail.module'

import { AuthCoreModule } from './auth/auth-core.module'
// import { APP_GUARD } from '@nestjs/core'
// import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',

        host: cfg.get<string>('DB_HOST'),
        port: Number(cfg.get('DB_PORT')),
        database: cfg.get<string>('DB_NAME'),
        username: cfg.get<string>('DB_USER'),
        password: String(cfg.get('DB_PASS') ?? ''),

        schema: cfg.get<string>('DB_SCHEMA') || 'public',

        autoLoadEntities: true,
        synchronize: false,

        // Heroku Postgres via Railway exige SSL cifrado
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),

    AuthCoreModule,
    ClientesModule,
    VisitasModule,
    GmailModule,
  ],
  providers: [
    // { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
