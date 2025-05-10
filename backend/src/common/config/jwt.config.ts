import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  return {
    secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    signOptions: {
      expiresIn: configService.getOrThrow<string>('JWT_ACCESS_EXPIRATION'),
    },
  };
};
