import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private readonly repo: Repository<Permission>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

async findAll() {
  let perms = await this.cacheManager.get<Permission[]>('perms') ?? [];

  if (perms.length === 0) {
    perms = await this.repo.find();
    await this.cacheManager.set('perms', perms, 0);
  }

  return perms;
}

}
