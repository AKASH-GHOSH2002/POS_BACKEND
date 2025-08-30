import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { CreateStoreDto, PaginationDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>
  ) { }

  create(dto: CreateStoreDto) {
    const store = this.storeRepository.create(dto);
    return this.storeRepository.save(store);
  }

  async findAll(dto: PaginationDto) {
    const query = this.storeRepository
      .createQueryBuilder('store')
      .select([
        'store.id',
        'store.name',
        'store.address',
        'store.phone',
        'store.email',
        'store.status'
      ]);
    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('store.name LIKE :keyword', { keyword: `%${dto.keyword}%` })
            .orWhere('store.address LIKE :keyword', { keyword: `%${dto.keyword}%` })
            .orWhere('store.phone LIKE :keyword', { keyword: `%${dto.keyword}%` });
        }),
      );
    }
    if (dto.status) {
      query.andWhere('store.status = :status', { status: dto.status });
    }
    const [result, total] = await query
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('store.name', 'ASC')
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { total, result };
  }

  async findOneByStff(accountId: string) {
    return this.storeRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.account', 'account')
      .select([
        'store.id',
        'store.name',
        'store.address',
        'store.phone',
        'store.email',
        'store.status',
        'account.id',
      ])
      .where('account.id = :accountId', { accountId })
      .getOne();
  }

  async findOne(id: string) {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async update(id: string, dto: UpdateStoreDto) {
    await this.storeRepository.update(id, dto);
    return this.findOne(id);
  }

  // async transferStock(fromStoreId: string, toStoreId: string, productId: string, quantity: number) {
  //   // Validate stores exist
  //   const fromStore = await this.findOne(fromStoreId);
  //   const toStore = await this.findOne(toStoreId);

  //   // Get source inventory
  //   const sourceInventory = await this.inventoryRepository.findOne({
  //     where: { storeId: fromStoreId, productId }
  //   });

  //   if (!sourceInventory || sourceInventory.quantity < quantity) {
  //     throw new BadRequestException('Insufficient stock in source store');
  //   }

  //   // Get or create destination inventory
  //   let destInventory = await this.inventoryRepository.findOne({
  //     where: { storeId: toStoreId, productId }
  //   });

  //   if (!destInventory) {
  //     destInventory = this.inventoryRepository.create({
  //       storeId: toStoreId,
  //       productId,
  //       quantity: 0
  //     });
  //   }

  //   // Update quantities
  //   sourceInventory.quantity -= quantity;
  //   destInventory.quantity += quantity;

  //   // Save changes
  //   await this.inventoryRepository.save([sourceInventory, destInventory]);

  //   return {
  //     message: 'Stock transferred successfully',
  //     transfer: {
  //       fromStore: fromStore.name,
  //       toStore: toStore.name,
  //       quantity,
  //       remainingStock: sourceInventory.quantity
  //     }
  //   };
  // }

}