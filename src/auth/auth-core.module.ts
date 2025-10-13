// src/auth/auth-core.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const secret = cfg.get<string>('JWT_SECRET', 'change-me');
        // Acepta “1d”, “30m”, etc. y evitamos el problema de tipos con un cast.
        const expiresIn = (cfg.get<string>('JWT_EXPIRES_IN', '1d') as unknown) as number;

        return {
          secret,
          signOptions: {
            expiresIn,         // <- cast arriba
            algorithm: 'HS256' // igual que en el servicio de Auth
          },
        };
      },
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class AuthCoreModule {}
