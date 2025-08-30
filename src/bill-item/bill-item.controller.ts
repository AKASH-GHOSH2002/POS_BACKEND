import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Bill Items')
@Controller('bill-item')
export class BillItemController {}