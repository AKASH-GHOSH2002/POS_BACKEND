import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification } from './entities/notification.entity';
import { Product } from '../product/entities/product.entity';
import { DefaultStatus, NotificationType, UserRole } from '../enum';
import { PaginationDto } from './dto/notification.dto';
import { Account } from 'src/account/entities/account.entity';
import { Store } from 'src/store/entities/store.entity';
import { InventoryService } from './../inventory/inventory.service';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';
import { CronExpressions } from 'src/common/cron.constants';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(notificationData: {
    title: string;
    desc: string;
    accountId?: string;
    type?: NotificationType;
  }) {
    const notification = this.repo.create({
      title: notificationData.title,
      desc: notificationData.desc,
      accountId: notificationData.accountId,
      type: notificationData.type || NotificationType.SYSTEM,
      read: false,
    });

    return this.repo.save(notification);
  }

  async createLowStockNotification(
    storeName: string,
    productName: string,
    stock: number,
    accountId: string,
  ) {
    const existing = await this.repo.findOne({
      where: {
        title: 'Low Stock Alert',
        desc: `Product "${productName}" in store "${storeName}" is low on stock. Only ${stock} stock left.`,
        read: false,
        accountId,
      },
    });

    if (existing) return;

    const notification = this.repo.create({
      title: 'Low Stock Alert',
      desc: `Product "${productName}" in store "${storeName}" is low on stock. Only ${stock} stock left.`,
      type: NotificationType.SYSTEM,
      read: false,
      accountId,
    });

    await this.repo.save(notification);
  }

  async getLowStock(storeId: string, accountId: string) {
    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoin('inventory.product', 'product')
      .leftJoin('inventory.store', 'store')
      .select([
        'inventory.id',
        'inventory.stock',
        'inventory.minStock',
        'product.id',
        'product.name',
        'store.id',
        'store.name',
      ])
      .where('inventory.isActive = :isActive', { isActive: true })
      .andWhere('inventory.stock <= inventory.minStock');

    if (storeId) {
      query.andWhere('inventory.storeId = :storeId', { storeId });
    }

    const [result, total] = await query
      .orderBy('inventory.stock', 'ASC')
      .getManyAndCount();

    if (!result || result.length === 0) return;

    for (const item of result) {
      await this.createLowStockNotification(
        item.store.name,
        item.product.name,
        item.stock,
        accountId,
      );
    }

    return { total, result };
  }

  async createOutOfStockNotification(
    storeName: string,
    productName: string,
    accountId: string,
  ) {
    const existing = await this.repo.findOne({
      where: {
        title: 'Out of Stock Alert',
        desc: `Product "${productName}" in store "${storeName}" is out of stock.`,
        read: false,
        accountId,
      },
    });

    if (existing) return;

    const notification = this.repo.create({
      title: 'Out of Stock Alert',
      desc: `Product "${productName}" in store "${storeName}" is out of stock.`,
      type: NotificationType.SYSTEM,
      read: false,
      accountId,
    });

    await this.repo.save(notification);
  }

  async getOutOfStock(storeId: string, accountId: string) {
    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoin('inventory.product', 'product')
      .leftJoin('inventory.store', 'store')
      .select([
        'inventory.id',
        'inventory.stock',
        'product.id',
        'product.name',
        'store.id',
        'store.name',
      ])
      .where('inventory.isActive = :isActive', { isActive: true })
      .andWhere('inventory.stock <= 0');

    if (storeId) {
      query.andWhere('inventory.storeId = :storeId', { storeId });
    }

    const [result, total] = await query
      .orderBy('inventory.stock', 'ASC')
      .getManyAndCount();

    if (!result || result.length === 0) return;

    for (const item of result) {
      await this.createOutOfStockNotification(
        item.store.name,
        item.product.name,
        accountId,
      );
    }

    return { total, result };
  }

  @Cron(CronExpressions.EVERY_EVENING_4_PM)
  async handleStockNotificationsCron() {
    console.log('⏳ Running Stock Notifications Cron...');

  
    const adminAccounts = await this.accountRepository.find({
      where: { roles: UserRole.ADMIN,  },
      select: ['id'],
    });

  
    const stores = await this.storeRepository.find({
      select: ['id'],
    });

   
    for (const store of stores) {
      for (const admin of adminAccounts) {
        await this.getLowStock(store.id, admin.id);
        await this.getOutOfStock(store.id, admin.id);
      }
    }
  }

  async findAll(dto: PaginationDto, accountId: string) {
    const [result, total] = await this.repo
      .createQueryBuilder('notification')
      .where(
        'notification.accountId = :accountId OR notification.accountId IS NULL',
        { accountId },
      )
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy('notification.createdAt', 'DESC')
      .getManyAndCount();
    return { result, total };
  }




  async update(id: number, accountId: string, status: boolean) {
    const notifs = await this.repo.findOne({ where: { id, accountId } });
    if (!notifs) throw new NotFoundException('Notification not found!');
    notifs.read = status;
    return this.repo.save(notifs);
  }

  async markAllAsRead(accountId: string) {
    if (!accountId) {
      throw new BadRequestException('accountId is required');
    }

    try {
      const result = await this.repo
        .createQueryBuilder()
        .update()
        .set({ read: true })
        .where('accountId = :accountId', { accountId })
        .andWhere('read = :read', { read: false })
        .execute();

      return {
        message: 'All notifications marked as read',
        count: result.affected || 0,
      };
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return { message: 'All notifications marked as read', count: 0 };
    }
  }

  async clearAllNotifications(accountId: string) {
    try {
      const result = await this.repo.delete({ accountId });
      return {
        message: 'All notifications cleared',
        count: result.affected || 0,
      };
    } catch (error) {
      return { message: 'All notifications cleared', count: 0 };
    }
  }

  async getUnreadCount(accountId: string) {
    const count = await this.repo.count({ where: { accountId, read: false } });
    return { count };
  }
}
