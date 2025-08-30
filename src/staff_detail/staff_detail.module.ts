import { Module } from '@nestjs/common';
import { StaffDetailService } from './staff_detail.service';
import { StaffDetailController } from './staff_detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffDetail } from './entities/staff_detail.entity';
import { Account } from './../account/entities/account.entity';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
  
  TypeOrmModule.forFeature([StaffDetail,Account]),AuthModule
    
  ],
  controllers: [StaffDetailController],
  providers: [StaffDetailService],
})
export class StaffDetailModule {}
