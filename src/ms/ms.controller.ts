import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MsService } from './ms.service';

@Controller('ms')
export class MsController {
  constructor(private readonly service: MsService) {}
  @MessagePattern('hello')
  hello(data: unknown) {
    return this.service.hello(data);
  }
}
