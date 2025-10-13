// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type Algo = 'HS256' | 'RS256';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    // Resuelve clave y algoritmo de forma segura (sin undefined)
    const publicKeyB64 = process.env.JWT_PUBLIC_KEY; // PEM pública en Base64 (para RS256)
    const secret = process.env.JWT_SECRET;           // secreto simétrico (para HS256)

    let secretOrKey: string | Buffer;
    let algorithms: Algo[];

    if (publicKeyB64 && publicKeyB64.trim().length > 0) {
      secretOrKey = Buffer.from(publicKeyB64, 'base64'); // PEM pública
      algorithms = ['RS256'];
    } else if (secret && secret.trim().length > 0) {
      secretOrKey = secret;
      algorithms = ['HS256'];
    } else {
      throw new Error(
        'JWT misconfigurado: define JWT_SECRET (HS256) o JWT_PUBLIC_KEY (Base64, RS256).'
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
      algorithms,
      issuer: process.env.JWT_ISS || undefined,
      audience: process.env.JWT_AUD || undefined,
    });
  }

  async validate(payload: any) {
    return {
      sub: payload.sub,
      userId: payload.sub, // compat
      email: payload.email,
      name: payload.name,
      roles: payload.roles ?? [],
    };
  }
}
