import { Account } from "src/account/entities/account.entity";
import { Bill } from "src/bill/entities/bill.entity";
import { Store } from "src/store/entities/store.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StaffDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
   image: string;

  @Column({ type: 'text', nullable: true })
  imageName: string;

  @Column({ type: 'uuid', nullable: true })
  accountId: string;

  @ManyToOne(() => Store, (store) => store.staffDetails, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({ type: 'uuid', nullable: true })
  storeId: string;

  @ManyToOne(() => Account, (account) => account.staffDetail, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  account: Account;

  // @OneToMany(() => Bill, (bill) => bill.staff)
  // bills: Bill[];
}
