import { Test, TestingModule } from '@nestjs/testing';
import { MsController } from './ms.controller';

describe('MsController', () => {
  let controller: MsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MsController],
    }).compile();

    controller = module.get<MsController>(MsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
