import { Controller, Get, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query() query: unknown, @Req() req) {
    return this.appService.getHello(query, req.requestId);
  }
}
