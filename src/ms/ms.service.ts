import { Injectable } from '@nestjs/common';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
@Injectable()
export class MsService {
  constructor(private readonly logger: OgmaService) {}
  hello(data: unknown): {
    data: unknown;
    traceId: string;
  } {
    this.logger.info('MS service logger', { data });
    return {
      data,
      traceId: '',
    };
  }
}
