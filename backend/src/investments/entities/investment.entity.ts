
import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';

export enum InvestmentTypes {
    MUTUAL_FUND = 'MUTUAL_FUND',
    EQUITY = 'EQUITY',
    OTHER = 'OTHER'
}

@Entity('investments')
export class Investment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    buy_amount: number;

    @Column()
    sell_amount: number;

    @Column({
        type: 'enum',
        enum: InvestmentTypes,
        default: InvestmentTypes.OTHER,
    })
    type: InvestmentTypes;

    @Column()
    buy_date: Date;

    @Column({ nullable: true })
    sell_date: Date;

    @Column({ nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => User, (user) => user.investments, { onDelete: 'CASCADE' })
    user: User;

}
