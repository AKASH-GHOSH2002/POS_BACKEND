import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { PageDto } from './dto/page.dto';
import { Page } from './entities/page.entity';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page) private readonly repo: Repository<Page>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }


  async create(dto: PageDto) {
    const page = this.repo.create(dto);
    const saved = await this.repo.save(page);
    await this.cacheManager.set('page' + saved.id, saved, 7 * 24 * 60 * 60 * 1000);
    return saved;
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    if (isNaN(id)) {
      throw new NotFoundException('Invalid page ID. Must be a number.');
    }
    return this.getPage(id);
  }

  async update(id: number, updatePageDto: PageDto) {
    const page = await this.getPage(id);
    this.delPage(id);
    const obj = Object.assign(page, updatePageDto);
    return this.repo.save(obj);
  }

  private delPage = (id: number) => {
    this.cacheManager.del('page' + id);
  };

  private getPage = async (id: number) => {
    if (!id) {
      throw new NotFoundException('Page ID is required');
    }
    let result = await this.cacheManager.get('page' + id);
    if (!result) {
      result = await this.repo.findOne({ where: { id } });
      this.cacheManager.set('page' + id, result, 7 * 24 * 60 * 60 * 1000);
    }
    if (!result) {
      throw new NotFoundException('Not found!');
    }
    return result;
  };
}
