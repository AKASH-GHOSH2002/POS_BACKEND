import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BillTaxService } from './bill-tax.service';
import { CreateBillTaxDto } from './dto/create-bill-tax.dto';
import { UpdateBillTaxDto } from './dto/update-bill-tax.dto';

@Controller('bill-tax')
export class BillTaxController {
  constructor(private readonly billTaxService: BillTaxService) {}

  @Post()
  create(@Body() createBillTaxDto: CreateBillTaxDto) {
    return this.billTaxService.create(createBillTaxDto);
  }

  @Get()
  findAll() {
    return this.billTaxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billTaxService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillTaxDto: UpdateBillTaxDto) {
    return this.billTaxService.update(+id, updateBillTaxDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billTaxService.remove(+id);
  }
}
