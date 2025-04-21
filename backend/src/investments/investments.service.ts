import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Investment } from './entities/investment.entity';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { User } from 'src/users/entities/user.entity';
import { FilterInvestmentsDto } from './dto/filter-investments.dto';
import { calculateIncomeTax } from 'src/utils/investment';

@Injectable()
export class InvestmentsService {
    constructor(
        @InjectRepository(Investment)
        private investmentsRepository: Repository<Investment>,
    ) { }

    async create(createInvestmentDto: CreateInvestmentDto, user: User): Promise<Investment> {

        const investment = this.investmentsRepository.create({ ...createInvestmentDto, user: user });
        return this.investmentsRepository.save(investment);
    }

    async findById(id: string): Promise<Investment | null> {
        return this.investmentsRepository.findOne({ where: { id } });
    }

    async getInvestments(
        user: User,
        filters: FilterInvestmentsDto,
    ) {

        let {
            isActive = 'true',
            buy_date,
            sell_date,
            page,
            limit,
        } = filters;
        page = parseInt(String(page)) || 1;
        limit = parseInt(String(limit)) || 10;
        const query = this.investmentsRepository.createQueryBuilder('investments')
            .where('investments.userId = :userId', { userId: user.id });

        if (isActive !== undefined) {
            query.andWhere('investments.isActive = :isActive', {
                isActive: isActive === 'true',
            });
        }

        if (buy_date) {
            query.andWhere('investments.buy_date >= :buy_date', { buy_date });
        }

        if (sell_date) {
            query.andWhere('investments.sell_date <= :sell_date', { sell_date });
        }

        const [items, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('investments.created_at', 'DESC')
            .getManyAndCount();

        return {
            data: items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async update(
        id: string,
        updateDto: Partial<CreateInvestmentDto>,
        user: User,
    ): Promise<Investment> {
        const investment = await this.investmentsRepository.findOne({
            where: { id, user: { id: user.id } },
            relations: ['user'],
        });

        if (!investment) {
            throw new Error('Investment not found or access denied');
        }

        const updated = this.investmentsRepository.merge(investment, updateDto);
        return this.investmentsRepository.save(updated);
    }

    async getInvestmentsByFY(
        fy: string,
        user: User,
        filters: FilterInvestmentsDto,
    ) {
        let {
            isActive = 'true',
            page,
            limit,
        } = filters;
        page = parseInt(String(page)) || 1;
        limit = parseInt(String(limit)) || 10;
        fy = fy || '2025';
        const start_date = new Date(`${fy}-01-01`).toISOString();
        const end_date = new Date(`${fy}-12-31`).toISOString();
        const query = this.investmentsRepository.createQueryBuilder('investments')
            .where('investments.userId = :userId', { userId: user.id });

        if (isActive !== undefined) {
            query.andWhere('investments.isActive = :isActive', {
                isActive: isActive === 'true',
            });
        }
        query.andWhere('(investments.buy_date >= :start_date AND investments.buy_date <= :end_date)',
            { start_date, end_date }
        );
        const [items, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('investments.created_at', 'DESC')
            .getManyAndCount();

        return {
            data: items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getInvestmentStatusFY(
        fy: string,
        user: User,
        filters: FilterInvestmentsDto,
    ) {
        let {
            isActive = 'true',
            page,
            limit,
        } = filters;
        page = parseInt(String(page)) || 1;
        limit = parseInt(String(limit)) || 10;
        fy = fy || '2025';
        const start_date = new Date(`${fy}-01-01`).toISOString();
        const end_date = new Date(`${fy}-12-31`).toISOString();
        const query = this.investmentsRepository.createQueryBuilder('investments')
            .where('investments.userId = :userId', { userId: user.id });

        if (isActive !== undefined) {
            query.andWhere('investments.isActive = :isActive', {
                isActive: isActive === 'true',
            });
        }
        query.andWhere(
            new Brackets((qb) => {
                qb.where('(investments.buy_date >= :start_date AND investments.buy_date <= :end_date)',
                    { start_date, end_date })
                    .orWhere('investments.sell_date IS NULL')
                    .orWhere('investments.sell_date >= :start_date AND investments.buy_date <= :end_date', { start_date, end_date });
            })
        );
        const [items, total] = await query.getManyAndCount();

        return {
            data: items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getInvestmentByHoldingTime(

        user: User,
        filters: FilterInvestmentsDto,
    ) {
        let {
            isActive = 'true',
            page,
            limit,
            holding_type = 'SHORT_TERM'
        } = filters;
        page = parseInt(String(page)) || 1;
        limit = parseInt(String(limit)) || 10;

        const query = this.investmentsRepository.createQueryBuilder('investments')
            .where('investments.userId = :userId', { userId: user.id });

        if (isActive !== undefined) {
            query.andWhere('investments.isActive = :isActive', {
                isActive: isActive === 'true',
            });
        }
        let oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (holding_type === 'SHORT_TERM') {
            query.andWhere('(investments.sell_date IS NULL AND investments.buy_date >= :date)',
                { date: oneYearAgo }
            );
        }
        if (holding_type === 'LONG_TERM') {
            query.andWhere('(investments.sell_date IS NULL AND investments.buy_date <= :date)',
                { date: oneYearAgo }
            );
        }
        const [items, total] = await query.getManyAndCount();

        return {
            data: items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getInvestmentStats(user: User, filters: FilterInvestmentsDto) {
        try {
            let {
                isActive = 'true',
            } = filters;

            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            const baseQueryBuilder = () => {
                const query = this.investmentsRepository.createQueryBuilder('investments')
                    .where('investments.userId = :userId', { userId: user.id });

                if (isActive !== undefined) {
                    query.andWhere('investments.isActive = :isActive', {
                        isActive: isActive === 'true',
                    });
                }

                return query;
            };

            const shortTermQuery = baseQueryBuilder()
                .andWhere('(investments.buy_date >= :date AND investments.sell_date IS NOT NULL)', { date: oneYearAgo });

            const longTermQuery = baseQueryBuilder()
                .andWhere('(investments.buy_date <= :date AND investments.sell_date IS NOT NULL)', { date: oneYearAgo });

            const [shortTerm, longTerm] = await Promise.all([
                shortTermQuery.getManyAndCount(),
                longTermQuery.getManyAndCount()
            ]);

            const shortTermTaxInput = shortTerm[0].reduce(
                (totals, inv) => {
                    totals.buy += inv.buy_amount || 0;
                    totals.sell += inv.sell_amount || 0;
                    return totals;
                },
                { buy: 0, sell: 0 }
            );

            const longTermTaxInput = longTerm[0].reduce(
                (totals, inv) => {
                    totals.buy += inv.buy_amount || 0;
                    totals.sell += inv.sell_amount || 0;
                    return totals;
                },
                { buy: 0, sell: 0 }
            );

            const short_term_net_income = shortTermTaxInput.sell - shortTermTaxInput.buy;
            const long_term_net_income = longTermTaxInput.sell - longTermTaxInput.buy;
            return {
                short_term: {
                    ...shortTermTaxInput,
                    short_term_net_income,
                    tax: calculateIncomeTax(short_term_net_income, 'short_term')
                },
                long_term: {
                    ...longTermTaxInput,
                    long_term_net_income,
                    tax: calculateIncomeTax(long_term_net_income, 'long_term')
                }
            };
        } catch (error) {
            throw error;
        }
    }

}
