import { Account } from "src/account/entities/account.entity";
import { LogType } from "src/enum";
import { Column, CreateDateColumn, Entity,  ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LoginHistory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  loginId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ip: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  isp: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  origin: string;

  @Column({ type: 'enum', enum: LogType, default: LogType.LOGIN })
  type: LogType;

  @Column({ type: 'int', nullable: true }) 
  duration: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.loginHistory, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  account: Account[];


}