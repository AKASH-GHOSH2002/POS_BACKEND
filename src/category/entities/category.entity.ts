import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { DefaultStatus } from 'src/enum';
import { YesNo } from 'src/enum';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: DefaultStatus })
  status: DefaultStatus;

  @Column({ type: 'enum', enum: YesNo, default: YesNo.NO })
  hasType: YesNo;

  @Column({ type: 'enum', enum: YesNo, default: YesNo.NO })
  hasSize: YesNo;

  @Column({ type: 'enum', enum: YesNo, default: YesNo.NO })
  hasColor: YesNo;

  @Column({ type: 'enum', enum: YesNo, default: YesNo.NO })
  hasCapacity: YesNo;

  @Column({ type: 'enum', enum: YesNo, default: YesNo.NO })
  hasWeight: YesNo;

  @Column({ type: 'enum', enum: YesNo, default: YesNo.NO })
  hasWarranty: YesNo;

  @OneToMany(() => Product, (product) => product.category, { cascade: true })
  products: Product[];
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
