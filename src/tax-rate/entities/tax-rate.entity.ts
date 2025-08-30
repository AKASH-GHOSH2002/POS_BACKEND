
import { YesNo } from "src/enum";
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";


@Entity('tax')
export class TaxRate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'float' })
    percentage: number;

    @Column({ type: 'enum', enum: YesNo, default: YesNo.YES })
    isActive: YesNo;

   
}
