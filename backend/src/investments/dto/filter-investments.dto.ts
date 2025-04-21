import { IsOptional, IsBooleanString, IsDateString, IsNumberString, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterInvestmentsDto {
    @IsOptional()
    @IsBooleanString()
    isActive?: string;

    @IsOptional()
    @IsDateString()
    buy_date?: string;

    @IsOptional()
    @IsDateString()
    sell_date?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsDateString()
    fy?: string;

    @IsOptional()
    @IsString()
    holding_type?: string;
}
