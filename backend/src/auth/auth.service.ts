import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateToken() {
    const payload = {};
    return this.jwtService.sign(payload);
  }

  async validateToken(token: string) {
    const payload = await this.jwtService.verifyAsync(token);
    return payload;
  }
}
