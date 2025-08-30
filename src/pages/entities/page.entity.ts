import { PageType } from 'src/enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Page {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: PageType })
  title: PageType;

  @Column({ type: 'text' })
  desc: string;
}
