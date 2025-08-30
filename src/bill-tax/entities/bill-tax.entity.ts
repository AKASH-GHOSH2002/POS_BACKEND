import { Bill } from 'src/bill/entities/bill.entity';
import { TaxRate } from 'src/tax-rate/entities/tax-rate.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class BillTax {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Bill, (bill) => bill.taxes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'billId' })
  bill: Bill;

  @Column({ type: 'uuid' })
  billId: string;

  @ManyToOne(() => TaxRate, { nullable: true })
  @JoinColumn({ name: 'taxRateId' })
  taxRate: TaxRate;

  @Column({ type: 'uuid', nullable: true })
  taxRateId: string;

  @Column({ type: 'varchar', length: 100 })
  taxName: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  taxPercent: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  taxAmount: number; 
}
