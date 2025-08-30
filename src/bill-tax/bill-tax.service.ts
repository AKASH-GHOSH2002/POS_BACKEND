import { Injectable } from '@nestjs/common';
import { CreateBillTaxDto } from './dto/create-bill-tax.dto';
import { UpdateBillTaxDto } from './dto/update-bill-tax.dto';

@Injectable()
export class BillTaxService {
  create(createBillTaxDto: CreateBillTaxDto) {
    return 'This action adds a new billTax';
  }

  findAll() {
    return `This action returns all billTax`;
  }

  findOne(id: number) {
    return `This action returns a #${id} billTax`;
  }

  update(id: number, updateBillTaxDto: UpdateBillTaxDto) {
    return `This action updates a #${id} billTax`;
  }

  remove(id: number) {
    return `This action removes a #${id} billTax`;
  }
}
