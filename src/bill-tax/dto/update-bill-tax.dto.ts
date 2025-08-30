import { PartialType } from '@nestjs/swagger';
import { CreateBillTaxDto } from './create-bill-tax.dto';

export class UpdateBillTaxDto extends PartialType(CreateBillTaxDto) {}
