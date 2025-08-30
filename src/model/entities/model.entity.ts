import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { DefaultStatus } from 'src/enum';

@Entity()
export class Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: DefaultStatus })
  status: DefaultStatus;

  @OneToMany(() => Product, (product) => product.model)
  products: Product[];
}
