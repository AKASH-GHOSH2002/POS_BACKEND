import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { Bill } from '../../bill/entities/bill.entity';
import { Expense } from '../../expense/entities/expense.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { StockMovement } from '../../stock-movement/entities/stock-movement.entity';
import { PriceGroup } from 'src/price-group/entities/price-group.entity';
import { DefaultStatus } from 'src/enum';
import { Account } from 'src/account/entities/account.entity';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';


@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;


  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  storeCode: string;

  @Column({ type: 'enum', enum: DefaultStatus, default: DefaultStatus.ACTIVE })
  status: DefaultStatus;

  @ManyToOne(() => PriceGroup, { nullable: true })
  @JoinColumn({ name: 'priceGroupId' })
  priceGroup: PriceGroup;

  @Column({ type: 'uuid', nullable: true })
  priceGroupId: string;

  @OneToMany(() => Account, (account) => account.store, { cascade: true })
  account: Account[];

  @OneToMany(() => Inventory, (inventory) => inventory.store, { cascade: true })
  inventory: Inventory[];

  @OneToMany(() => Bill, (bill) => bill.store, { cascade: true })
  bills: Bill[];

  @OneToMany(() => Expense, (expense) => expense.store, { cascade: true })
  expenses: Expense[];

  @OneToMany(() => Customer, (customer) => customer.store)
  customers: Customer[];

  @OneToMany(() => StockMovement, (movement) => movement.store)
  stockMovements: StockMovement[];

@OneToMany(() => StaffDetail, (staffDetail) => staffDetail.store)
staffDetails: StaffDetail[];


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}