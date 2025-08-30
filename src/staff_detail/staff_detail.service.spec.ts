import { Test, TestingModule } from '@nestjs/testing';
import { StaffDetailService } from './staff_detail.service';

describe('StaffDetailService', () => {
  let service: StaffDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffDetailService],
    }).compile();

    service = module.get<StaffDetailService>(StaffDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
