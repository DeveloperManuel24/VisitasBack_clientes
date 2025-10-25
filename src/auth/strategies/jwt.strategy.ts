// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    // ✅ Se asegura de que el secreto nunca sea undefined
    const secretOrKey = cfg.get<string>('JWT_SECRET') || 'change-me';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,          // el token debe estar vigente
      secretOrKey,                      // usa el mismo secret del servicio de Usuarios
      algorithms: ['HS256'],            // mismo algoritmo
      // No exigimos issuer/audience para evitar rechazar tokens válidos
    });
  }

  async validate(payload: any) {
    // Este objeto se inyecta en req.user
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles ?? [],
    };
  }
}
