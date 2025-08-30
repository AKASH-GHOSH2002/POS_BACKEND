import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { BillItem } from '../bill-item/entities/bill-item.entity';
import { Product } from '../product/entities/product.entity';
import { Customer } from '../customer/entities/customer.entity';

import { Inventory } from '../inventory/entities/inventory.entity';
import { ProductPriceService } from '../product-price/product-price.service';
import { CreateBillDto, PaginationDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { ProcessPaymentDto } from './dto/payment.dto';
import { BillStatus, LedgerType, PaymentMethod } from 'src/enum';
import { generateInvoice } from '../utils/bill-pdf.utils';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';
import { TaxRate } from 'src/tax-rate/entities/tax-rate.entity';
import { InventoryService } from 'src/inventory/inventory.service';
import { PayBillDto } from './dto/pay-bill.dto';
import { CustomerService } from 'src/customer/customer.service';
import { BillTax } from 'src/bill-tax/entities/bill-tax.entity';
import { CreateHoldBillDto } from './dto/hold-bill.dto';
import { BillNumberUtil } from 'src/utils/bill-number.util';
import { UpdateDueAndPurchaseDto } from 'src/customer/dto/update-customer.dto';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(BillItem)
    private readonly billItemRepository: Repository<BillItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly productPriceService: ProductPriceService,
    @InjectRepository(StaffDetail)
    private readonly staffRepository: Repository<StaffDetail>,
    @InjectRepository(TaxRate)
    private readonly taxRateRepository: Repository<TaxRate>,
    @InjectRepository(BillTax)
    private readonly billTaxRepository: Repository<BillTax>,
    private readonly inventoryService: InventoryService,
    private readonly customerService: CustomerService,
  ) {}
  async create(dto: CreateBillDto, staffId: string) {
    const staff = await this.staffRepository.findOne({
      where: { accountId: staffId },
      relations: ['store'],
    });

    if (!staff || !staff.store) {
      throw new NotFoundException(`Store not found for staff ${staffId}`);
    }

    const storeId = staff.store.id;
    const branchCode = staff.store.storeCode;

    const billNumber = await this.generateBillNumber(storeId, branchCode);

    const subtotal = Number(dto.subtotal) || 0;
    const taxAmount = Number(dto.taxAmount) || 0;
    const discountAmount = Number(dto.discountAmount) || 0;
    const discountPercent = Number(dto.discountPercent) || 0;
    const total = Number(dto.total) || 0;
    const paidAmount = Number(dto.paidAmount) || 0;
    const prevDuePaidAmount = Number(dto.prevDuePaidAmount) || 0;
    const previousDue = Number(dto.previousDue) || 0;
    const totalBillAmount = Number(dto.totalBillAmount) || 0;

    if (dto.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(`Customer not found: ${dto.customerId}`);
      }
    }

    
    let dueAmount = total - paidAmount - prevDuePaidAmount;
    if (dueAmount < 0) {
      dueAmount = 0; 
    }

    const status: BillStatus = dueAmount > 0 ? BillStatus.DUE : BillStatus.PAID;

    const bill = this.billRepository.create({
      billNumber,
      subtotal,
      taxAmount,
      discountAmount,
      discountPercent,
      total,
      paidAmount,
      dueAmount,
      status,
      note: dto.note,
      paymentMethod: dto.paymentMethod,
      customerId: dto.customerId || null,
      storeId,
      priceGroupId: dto.priceGroupId,
      staffId,
      previousDue,
      prevDuePaidAmount,
      totalBillAmount,
    });

    const savedBill = await this.billRepository.save(bill);

    for (const item of dto.items) {
      const unitPrice = item.unitPrice || 0;
      const itemSubtotal = unitPrice * item.quantity;
      const itemTotal = itemSubtotal;

      await this.billItemRepository.save({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
        total: itemTotal,
        billId: savedBill.id,
      });

      const stockDto = {
        productId: item.productId,
        storeId,
        quantity: item.quantity,
      };
      await this.inventoryService.saleStock(stockDto);
    }

    if (dto.taxes && dto.taxes.length > 0) {
      for (const tax of dto.taxes) {
        await this.billTaxRepository.save({
          billId: savedBill.id,
          taxName: tax.taxName,
          taxPercent: tax.taxPercent,
          taxAmount: tax.taxAmount,
          taxRateId: tax.taxRateId || null,
        });
      }
    }

    if (bill.customerId) {
      const updateDto: UpdateDueAndPurchaseDto = {
        customerId: bill.customerId,
        dueAmount,
        totalBillAmount,
      };
      await this.customerService.updateDueAndPurchase(updateDto);
    }

    return this.findOne(savedBill.id);
  }

  async createHoldBill(dto: CreateHoldBillDto, staffId: string) {
    const staff = await this.staffRepository.findOne({
      where: { accountId: staffId },
      relations: ['store'],
    });

    if (!staff || !staff.store) {
      throw new NotFoundException(`Store not found for staff ${staffId}`);
    }

    const storeId = staff.store.id;
    const branchCode = staff.store.storeCode;
    const billNumber = await this.generateBillNumber(storeId, branchCode);
    const subtotal = Number(dto.subtotal) || 0;
    const taxAmount = Number(dto.taxAmount) || 0;
    const discountAmount = Number(dto.discountAmount) || 0;
    const discountPercent = Number(dto.discountPercent) || 0;
    const total = Number(dto.total) || 0;
    const previousDue = Number(dto.previousDue) || 0;
    const totalBillAmount = Number(dto.totalBillAmount) || 0;

    const paidAmount = 0;
    const dueAmount = 0;
    const status = BillStatus.HOLD;

    if (dto.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(`Customer not found: ${dto.customerId}`);
      }
    }

    const bill = this.billRepository.create({
      billNumber,
      subtotal,
      taxAmount,
      discountAmount,
      discountPercent,
      total,
      paidAmount,
      dueAmount,
      status,
      note: dto.note,
      customerId: dto.customerId || null,
      storeId,
      priceGroupId: dto.priceGroupId,
      staffId,
      previousDue,
      totalBillAmount,
    });

    const savedBill = await this.billRepository.save(bill);

    for (const item of dto.items) {
      const unitPrice = item.unitPrice || 0;
      const itemSubtotal = unitPrice * item.quantity;
      const itemTotal = itemSubtotal;

      await this.billItemRepository.save({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
        total: itemTotal,
        billId: savedBill.id,
      });

      await this.inventoryService.reserveStock({
        productId: item.productId,
        storeId,
        quantity: item.quantity,
      });
    }

    if (dto.taxes && dto.taxes.length > 0) {
      for (const tax of dto.taxes) {
        await this.billTaxRepository.save({
          billId: savedBill.id,
          taxName: tax.taxName,
          taxPercent: tax.taxPercent,
          taxAmount: tax.taxAmount,
          taxRateId: tax.taxRateId || null,
        });
      }
    }

    return this.findOne(savedBill.id);
  }

  async findAll(dto: PaginationDto) {
    const query = this.billRepository
      .createQueryBuilder('bill')
      .leftJoin('bill.customer', 'customer')
      .leftJoin('bill.store', 'store')
      .leftJoin('bill.items', 'items')
      .leftJoin('items.product', 'product')
      .select([
        'bill.id',
        'bill.billNumber',
        'bill.status',
        'bill.subtotal',
        'bill.taxAmount',
        'bill.discountAmount',
        'bill.discountPercent',
        'bill.total',
        'bill.paidAmount',
        'bill.dueAmount',
        'bill.note',
        'bill.paymentMethod',
        'bill.priceGroupId',
        'bill.staffId',
        'bill.createdAt',
        'bill.updatedAt',
        'customer.id',
        'customer.name',
        'store.id',
        'store.name',
        'items.id',
        'items.quantity',
        'items.unitPrice',
        'items.subtotal',
        'items.total',
        'product.id',
        'product.name',
      ]);
    if (dto.storeId) {
      query.andWhere('bill.storeId = :storeId', { storeId: dto.storeId });
    }
    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('product.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          })
            .orWhere('product.id LIKE :keyword', {
              keyword: `%${dto.keyword}%`,
            })
            .orWhere('store.name LIKE :keyword', {
              keyword: `%${dto.keyword}%`,
            })
            .orWhere('bill.status LIKE :keyword', {
              keyword: `%${dto.keyword}%`,
            })
            .orWhere('bill.id LIKE :keyword', { keyword: `%${dto.keyword}%` });
        }),
      );
    }
    if (dto.status) {
      query.andWhere('bill.status = :status', { status: dto.status });
    }

    if (dto.date) {
      const startDate = new Date(dto.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.andWhere(
        'bill.createdAt >= :startDate AND bill.createdAt < :endDate',
        {
          startDate,
          endDate,
        },
      );
    }
    const [result, total] = await query
      .orderBy('bill.createdAt', 'DESC')
      .skip(dto.offset)
      .take(dto.limit)
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { result, total };
  }

  async findBillsByStore(userId: string, dto: PaginationDto) {
    const staff = await this.staffRepository.findOne({
      where: { accountId: userId },
      relations: ['store'],
    });

    if (!staff || !staff.store) {
      throw new BadRequestException('Store not found for the current staff');
    }
    const storeId = staff.storeId;
    const query = this.billRepository
      .createQueryBuilder('bill')
      .leftJoin('bill.customer', 'customer')
      .leftJoin('bill.store', 'store')
      .leftJoin('bill.items', 'items')
      .leftJoin('items.product', 'product')
      .select([
        'bill.id',
        'bill.billNumber',
        'bill.status',
        'bill.subtotal',
        'bill.taxAmount',
        'bill.discountAmount',
        'bill.discountPercent',
        'bill.total',
        'bill.paidAmount',
        'bill.dueAmount',
        'bill.note',
        'bill.paymentMethod',
        'bill.priceGroupId',
        'bill.staffId',
        'bill.createdAt',
        'bill.updatedAt',
        'customer.id',
        'customer.name',
        'store.id',
        'store.name',
        'items.id',
        'items.quantity',
        'items.unitPrice',
        'items.subtotal',
        'items.total',
        'product.id',
        'product.name',
      ])
      .where('bill.storeId = :storeId', { storeId });

    if (dto.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('customer.name LIKE :keyword', {
            keyword: `%${dto.keyword}%`,
          })
            .orWhere('customer.id LIKE :keyword', {
              keyword: `%${dto.keyword}%`,
            })
            .orWhere('bill.billNumber LIKE :keyword', {
              keyword: `%${dto.keyword}%`,
            })
            .orWhere('bill.status LIKE :keyword', {
              keyword: `%${dto.keyword}%`,
            })
            .orWhere('bill.id LIKE :keyword', { keyword: `%${dto.keyword}%` });
        }),
      );
    }

    if (dto.status) {
      query.andWhere('bill.status = :status', { status: dto.status });
    }

    if (dto.date) {
      const startDate = new Date(dto.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.andWhere(
        'bill.createdAt >= :startDate AND bill.createdAt < :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    const [result, total] = await query
      .orderBy('bill.createdAt', 'DESC')
      .skip(dto.offset)
      .take(dto.limit)
      .getManyAndCount();

    if (!result) {
      throw new NotFoundException('Data is not available');
    }

    return { result, total };
  }

  async findOne(id: string) {
    const result = await this.billRepository
      .createQueryBuilder('bill')
      .leftJoin('StaffDetail', 'staff', 'staff.accountId = bill.staffId') // 👈 match accountId
      .leftJoinAndSelect('bill.customer', 'customer')
      .leftJoinAndSelect('bill.store', 'store')
      .leftJoinAndSelect('bill.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('bill.taxes', 'taxes')
      .select([
        'bill.id',
        'bill.billNumber',
        'bill.status',
        'bill.subtotal',
        'bill.taxAmount',
        'bill.discountAmount',
        'bill.discountPercent',
        'bill.total',
        'bill.paidAmount',
        'bill.dueAmount',
        'bill.note',
        'bill.paymentMethod',
        'bill.priceGroupId',
        'bill.staffId',
        'bill.createdAt',
        'bill.updatedAt',
        'customer.id',
        'customer.name',
        'customer.phone',
        'customer.address',
        'store.id',
        'store.name',
        'store.address',
        'store.phone',
        'items.id',
        'items.quantity',
        'items.unitPrice',
        'items.subtotal',
        'items.total',
        'product.id',
        'product.name',
        'taxes.id',
        'taxes.taxName',
        'taxes.taxPercent',
        'taxes.taxAmount',
        'taxes.taxRateId',
        'staff.accountId', 
        'staff.name', 
      ])
      .where('bill.id = :id', { id })
      .getRawOne();

    if (!result) {
      throw new NotFoundException('Bill not found');
    }

    return result;
  }

  async payHoldBill(billId: string, dto: PayBillDto) {
    const bill = await this.billRepository.findOne({
      where: { id: billId },
      relations: ['items'],
    });

    if (!bill || bill.status !== BillStatus.HOLD) {
      throw new BadRequestException('Only HOLD bills can be paid');
    }

    bill.paidAmount = Number(dto.paidAmount) || 0;
    let dueAmount = bill.total - bill.paidAmount;
    if (dueAmount < 0) {
      dueAmount = 0;
    }
    bill.dueAmount = dueAmount;

    bill.status = bill.dueAmount > 0 ? BillStatus.DUE : BillStatus.PAID;
    bill.paymentMethod = dto.paymentMethod;

    await this.billRepository.save(bill);

    for (const item of bill.items) {
      const stockDto = {
        productId: item.productId,
        storeId: bill.storeId,
        quantity: item.quantity,
      };
      await this.inventoryService.releaseReservedStock(stockDto);
      await this.inventoryService.saleStock(stockDto);
    }

    if (bill.customerId) {
      const updateDto: UpdateDueAndPurchaseDto = {
        customerId: bill.customerId,
        dueAmount: bill.dueAmount,
        totalBillAmount: bill.totalBillAmount,
      };

      await this.customerService.updateDueAndPurchase(updateDto);
    }

    return this.findOne(bill.id);
  }

  async generateInvoicePdf(id: string) {
    const bill = await this.findOne(id);
    return generateInvoice(bill);
  }

  private async generateBillNumber(
    storeId: string,
    branchCode: string,
  ): Promise<string> {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const latestBill = await this.billRepository.findOne({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });

    let nextSerial = 1000;
    if (latestBill?.billNumber) {
      const parts = latestBill.billNumber.split('/');
      const lastDate = parts[2];
      const lastSerial = parseInt(parts[3], 10);

      if (lastDate === todayStr) {
        nextSerial = lastSerial + 1;
      }
    }

    return BillNumberUtil.generateBillNumber(branchCode, today, nextSerial);
  }

  async cancelHoldBill(billId: string) {
    const bill = await this.billRepository.findOne({
      where: { id: billId },
      relations: ['items'],
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    if (bill.status !== BillStatus.HOLD) {
      throw new BadRequestException('Only HOLD bills can be cancelled');
    }

    for (const item of bill.items) {
      const stockDto = {
        productId: item.productId,
        storeId: bill.storeId,
        quantity: item.quantity,
      };
      await this.inventoryService.releaseReservedStock(stockDto);
    }

    await this.billRepository.remove(bill);

    return { message: 'Hold bill cancelled and removed successfully' };
  }
}
