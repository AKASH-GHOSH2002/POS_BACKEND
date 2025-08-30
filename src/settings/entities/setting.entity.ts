
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DefaultStatus } from '../../enum';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: process.env.RN_EMAIL })
  email: string;

  @Column({ type: 'text', nullable: true })
  domain: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ type: 'text', nullable: true })
  logoPath: string;

  @Column({ type: 'text', nullable: true })
  wpLink: string;

  @Column({ type: 'text', nullable: true })
  fbLink: string;

  @Column({ type: 'text', nullable: true })
  instaLink: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  companyName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  companyCity: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  companyPhone: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  companyGstin: string;

  @Column({ type: 'int', default: 40, nullable: true })
  pdfMargin: number;

  @Column({ type: 'text', nullable: true })
  invoiceDeclaration: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.8 })
  gstPercentage: number;

  @Column({ type: 'enum', enum: DefaultStatus, default: DefaultStatus.ACTIVE })
  status: DefaultStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
