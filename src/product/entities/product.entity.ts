import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Brand } from '../../brand/entities/brand.entity';
import { Unit } from '../../unit/entities/unit.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { StockMovement } from '../../stock-movement/entities/stock-movement.entity';
import { ProductPrice } from '../../product-price/entities/product-price.entity';
import { BillItem } from 'src/bill-item/entities/bill-item.entity';
import { Model } from 'src/model/entities/model.entity';
import { StockStatus } from 'src/enum';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  imagePath: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellingPrice: number;

  @Column({ type: 'int', nullable: true })
  lowStockAlert: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  @Column({ type: 'date', nullable: true })
  manufactureDate: Date;

  @Column({ type: 'enum', enum: StockStatus, default: StockStatus.IN_STOCK })
  status: StockStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  capacity: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  weight: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  warranty: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Brand, (brand) => brand.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ type: 'uuid' })
  brandId: string;

  @ManyToOne(() => Unit, (unit) => unit.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @Column({ type: 'uuid' })
  unitId: string;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventory: Inventory[];

  @OneToMany(() => BillItem, (billItem) => billItem.product)
  billItems: BillItem[];

  @OneToMany(() => StockMovement, (movement) => movement.product)
  stockMovements: StockMovement[];

  @OneToMany(() => ProductPrice, (productPrice) => productPrice.product)
  productPrices: ProductPrice[];

  @ManyToOne(() => Model, (model) => model.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'modelId' })
  model: Model;

  @Column({ type: 'uuid', nullable: true })
  modelId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
