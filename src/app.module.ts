import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { ClientesModule } from './clientes/clientes.module';
import { VisitasModule } from './visitas/visitas.module';

// Auth “ligero” (solo verifica JWT emitidos por el otro servicio)
import { AuthCoreModule } from './auth/auth-core.module';
import { JwtStrategy } from './auth/guards/jwt-auth.guard';

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
        autoLoadEntities: true,
        synchronize: false,
        ssl: false,
      }),
    }),

    // 🔐 Verificación JWT (no emite tokens)
    AuthCoreModule,

    // módulos de dominio
    ClientesModule,
    VisitasModule, // <-- IMPORTANTE para que exista /visitas
  ],
  providers: [
    // ✅ Guard global: todo protegido por defecto.
    // Usa @Public() en controladores/rutas que quieras abrir.
    { provide: APP_GUARD, useClass: JwtStrategy },
  ],
})
export class AppModule {}
