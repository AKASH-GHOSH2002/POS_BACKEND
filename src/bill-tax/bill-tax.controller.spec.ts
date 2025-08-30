import { Test, TestingModule } from '@nestjs/testing';
import { BillTaxController } from './bill-tax.controller';
import { BillTaxService } from './bill-tax.service';

describe('BillTaxController', () => {
  let controller: BillTaxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillTaxController],
      providers: [BillTaxService],
    }).compile();

    controller = module.get<BillTaxController>(BillTaxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
