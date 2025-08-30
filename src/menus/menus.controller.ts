
import { Controller, Get } from '@nestjs/common';
import { MenusService } from './menus.service';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}


  @Get()
  async findAll() {
    return this.menusService.findAll();
  }
  
}
