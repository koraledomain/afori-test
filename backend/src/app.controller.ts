import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  @Get()
  @Public()
  getHello(): string {
    return 'Welcome to the Afori Test API';
  }
}
