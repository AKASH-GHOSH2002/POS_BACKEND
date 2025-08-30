import { Test, TestingModule } from '@nestjs/testing';
import { StaffDetailController } from './staff_detail.controller';
import { StaffDetailService } from './staff_detail.service';

describe('StaffDetailController', () => {
  let controller: StaffDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffDetailController],
      providers: [StaffDetailService],
    }).compile();

    controller = module.get<StaffDetailController>(StaffDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
