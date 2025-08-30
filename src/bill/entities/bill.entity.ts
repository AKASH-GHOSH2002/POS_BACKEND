import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Store } from '../../store/entities/store.entity';
import { BillItem } from 'src/bill-item/entities/bill-item.entity';
import { PriceGroup } from 'src/price-group/entities/price-group.entity';
import { BillStatus, PaymentMethod } from 'src/enum';
import { TaxRate } from 'src/tax-rate/entities/tax-rate.entity';
import { BillTax } from 'src/bill-tax/entities/bill-tax.entity';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';

@Entity()
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  billNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  previousDue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalBillAmount: number;


  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  prevDuePaidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dueAmount: number;

  @Column({ type: 'enum', enum: BillStatus, default: BillStatus.PAID })
  status: BillStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => Customer, { nullable: true })
  customer: Customer;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({ type: 'uuid' })
  storeId: string;

  @Column({ type: 'uuid' })
  staffId: string;

  // @ManyToOne(() => StaffDetail, (staff) => staff.bills, { eager: false })
  // @JoinColumn({ name: 'staffId' })  
  // staff: StaffDetail;

  @ManyToOne(() => PriceGroup, { nullable: true })
  @JoinColumn({ name: 'priceGroupId' })
  priceGroup: PriceGroup;

  @Column({ type: 'uuid', nullable: true })
  priceGroupId: string;

  @OneToMany(() => BillItem, (billItem) => billItem.bill, { cascade: true })
  items: BillItem[];
  
  @OneToMany(() => BillTax, (billTax) => billTax.bill, { cascade: true })
  taxes: BillTax[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}