import { Test, TestingModule } from '@nestjs/testing';
import { MsService } from './ms.service';

describe('MsService', () => {
  let service: MsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MsService],
    }).compile();

    service = module.get<MsService>(MsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
