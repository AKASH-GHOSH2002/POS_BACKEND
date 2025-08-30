import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { StockMovementPaginationDto } from './dto/stock-movement-pagination.dto';

@Injectable()
export class StockMovementService {
  constructor(
    @InjectRepository(StockMovement)
    private stockMovementRepo: Repository<StockMovement>,
  ) { }


  async create(data: Partial<StockMovement>): Promise<StockMovement> {
    const movement = this.stockMovementRepo.create(data);
    return this.stockMovementRepo.save(movement);
  }

  async getMovements(dto: StockMovementPaginationDto) {
    const query = this.stockMovementRepo
      .createQueryBuilder('movement')
      .select([
        'movement.id',
        'movement.type',
        'movement.quantity',
        'movement.previousStock',
        'movement.newStock',
        'movement.reference',
        'movement.notes',
        'movement.createdAt',
        'product.id',
        'product.name',
        'product.sku',
        'store.id',
        'store.name'
      ])
      .leftJoin('movement.product', 'product')
      .leftJoin('movement.store', 'store')
      .where('movement.productId = :productId', { productId: dto.productId })
      .orderBy('movement.createdAt', 'DESC')
      .skip(dto.offset)
      .take(dto.limit);

    if (dto.storeId) {
      query.andWhere('movement.storeId = :storeId', { storeId: dto.storeId });
    }

    const [result, total] = await query.getManyAndCount();
    return { total, result };
  }
}