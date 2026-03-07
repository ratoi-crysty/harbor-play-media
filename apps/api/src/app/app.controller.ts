import { Controller, Get } from '@nestjs/common';
import { PublicApi } from '@auth-lib/nest';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @PublicApi()
  @Get()
  getData() {
    return this.appService.getData();
  }
}
