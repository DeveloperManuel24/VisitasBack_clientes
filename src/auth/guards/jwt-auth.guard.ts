// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('JWT_SECRET', 'change-me'),
      algorithms: ['HS256'],
      issuer: cfg.get<string>('JWT_ISS') || undefined,
      audience: cfg.get<string>('JWT_AUD') || undefined,
    });
  }

  async validate(payload: any) {
    // Devuelve lo que quieras exponer en req.user
    return { userId: payload.sub, email: payload.email, name: payload.name, roles: payload.roles };
  }
}
