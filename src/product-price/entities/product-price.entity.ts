import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { PriceGroup } from '../../price-group/entities/price-group.entity';

@Entity()
export class ProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, product => product.productPrices)
  product: Product;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => PriceGroup, priceGroup => priceGroup.productPrices)
  priceGroup: PriceGroup;

  @Column({ type: 'uuid' })
  priceGroupId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

}