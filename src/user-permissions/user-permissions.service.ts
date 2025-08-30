import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserPermissionDto,
  UpdateUserPermissionDto,
} from './dto/permission.dto';
import { UserPermission } from './entities/user-permission.entity';
import { Menu } from 'src/menus/entities/menu.entity';
import { Permission } from 'src/permissions/entities/permission.entity';

@Injectable()
export class UserPermissionsService {
  constructor(
    @InjectRepository(UserPermission)
    private readonly repo: Repository<UserPermission>,
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async create(dto: CreateUserPermissionDto[]) {
    return this.repo.save(dto);
  }
   
   async findAll(id: string) {
  const result = await this.repo
    .createQueryBuilder('userPermission')
    .leftJoinAndSelect('userPermission.menu', 'menu')
    .leftJoinAndSelect('userPermission.permission', 'permission')
    .select([
      'userPermission.id',
      'userPermission.menuId',
      'userPermission.permissionId',
      'userPermission.status',
      'menu.id',
      'menu.name',
      'menu.title',
      'permission.id',
      'permission.name',
    ])
    .where('userPermission.accountId = :id', { id })
    .getMany(); 

  if (!result || result.length === 0) {
    throw new NotFoundException('User Permission not found!');
  }
  return result;
}

  async update(dto: UpdateUserPermissionDto[]) {
    try {
      // OLD VERSION WITH CACHE CLEARING (COMMENTED OUT)
      // this.delPermissions(dto[0].accountId);
      // await this.authService.clearPermissionsCache(dto[0].accountId);
      
      // NEW VERSION - NO CACHE TO CLEAR
      return this.repo.save(dto);
    } catch (error) {
      throw new NotAcceptableException(
        'Something bad happened! Try after some time!',
      );
    }
  }

  // OLD CACHE CLEARING METHOD (COMMENTED OUT)
  // private delPermissions(id: string) {
  //   this.cacheManager.del('userPermission' + id);
  // }
}
