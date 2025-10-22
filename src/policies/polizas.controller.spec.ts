import { Test, TestingModule } from '@nestjs/testing';
import { PolizasController } from './polizas.controller';
import { PolizasService } from './polizas.service';

describe('PolizasController', () => {
  let controller: PolizasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PolizasController],
      providers: [PolizasService],
    }).compile();

    controller = module.get<PolizasController>(PolizasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
