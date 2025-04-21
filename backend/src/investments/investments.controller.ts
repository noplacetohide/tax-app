import { Controller, Get, UseGuards, Request, Post, Body, Query, Put, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { FilterInvestmentsDto } from './dto/filter-investments.dto';

@Controller('api/v1/investments')
export class InvestmentsController {
    constructor(private investmentsService: InvestmentsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('/')
    createInvestment(@Body() createInvestmentDto: CreateInvestmentDto, @Request() req) {
        return this.investmentsService.create(createInvestmentDto, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateInvestment(
        @Param('id') id: string,
        @Body() updateDto: Partial<CreateInvestmentDto>,
        @Request() req,
    ) {
        const updated = await this.investmentsService.update(id, updateDto, req.user);
        return {
            message: 'Investment updated successfully',
            data: updated,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getInvestments(
        @Request() req,
        @Query() filters: FilterInvestmentsDto,
    ) {
        return this.investmentsService.getInvestments(req.user, filters);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/fy/:fy')
    async getInvestmentsByFY(
        @Param('fy') fy: string,
        @Request() req,
        @Query() filters: FilterInvestmentsDto,
    ) {
        return this.investmentsService.getInvestmentsByFY(fy, req.user, filters);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/investment-by-holding-time')
    async getInvestmentByHoldingTime(
        @Request() req,
        @Query() filters: FilterInvestmentsDto,
    ) {
        return this.investmentsService.getInvestmentByHoldingTime(req.user, filters);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/investment-stats')
    async getInvestmentStats(
        @Request() req,
        @Query() filters: FilterInvestmentsDto,
    ) {
        return this.investmentsService.getInvestmentStats(req.user, filters);
    }
}