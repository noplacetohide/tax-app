import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, } from 'class-validator';
import { InvestmentTypes } from '../entities/investment.entity';

export class CreateInvestmentDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    sell_amount: number;

    @IsNotEmpty()
    @IsNumber()
    buy_amount: number;

    @IsNotEmpty()
    @IsEnum(InvestmentTypes, {
        message: `type must be one of: ${Object.values(InvestmentTypes).join(', ')}`,
    })
    type: InvestmentTypes;

    @IsNotEmpty()
    @IsDateString()
    buy_date: Date;

    @IsDateString()
    @IsOptional()
    sell_date?: Date;

    @IsString()
    @IsOptional()
    notes?: string;

}
