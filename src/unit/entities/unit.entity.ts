import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { DefaultStatus } from 'src/enum';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'enum', enum: DefaultStatus })
  status: DefaultStatus;

  @Column({ type: 'varchar', length: 10, nullable: true })
  shortName: string;

  @OneToMany(() => Product, (product) => product.unit, { cascade: true })
  products: Product[];
}