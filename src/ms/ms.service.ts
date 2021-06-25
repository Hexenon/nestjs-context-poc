import { Injectable } from '@nestjs/common';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
@Injectable()
export class MsService {
  constructor(private readonly logger: OgmaService) {}
  hello(data: any): {
    data: unknown;
    traceId: string;
  } {
    this.logger.info('MS service logger');
    this.logger.info(data);
    return {
      data,
      traceId: data.traceId,
    };
  }
}
