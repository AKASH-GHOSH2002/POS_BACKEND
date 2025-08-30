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
import { Bill } from '../../bill/entities/bill.entity';

import { Store } from 'src/store/entities/store.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @ManyToOne(() => Store, (store) => store.customers)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({type:'uuid'})
  storeId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPurchases: number;

  @Column({ type: 'date', nullable: true })
  lastPaymentDate: Date;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => Bill, (bill) => bill.customer, { cascade: true })
  bills: Bill[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
