import { Module } from '@nestjs/common';
import { TaxRateService } from './tax-rate.service';
import { TaxRateController } from './tax-rate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxRate } from './entities/tax-rate.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([TaxRate]),AuthModule],
  controllers: [TaxRateController],
  providers: [TaxRateService],
})
export class TaxRateModule {}
