import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PageDto } from './dto/page.dto';
import { PagesService } from './pages.service';
// import  } from 'src/auth/guards/permissions.guard';
import { PermissionAction, UserRole } from 'src/enum';
// import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  create(@Body() dto: PageDto) {
    return this.pagesService.create(dto);
  }

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_MANAGER)
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePageDto: PageDto) {
    return this.pagesService.update(id, updatePageDto);
  }
}
