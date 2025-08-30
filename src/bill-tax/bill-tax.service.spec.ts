import { Test, TestingModule } from '@nestjs/testing';
import { BillTaxService } from './bill-tax.service';

describe('BillTaxService', () => {
  let service: BillTaxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillTaxService],
    }).compile();

    service = module.get<BillTaxService>(BillTaxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
