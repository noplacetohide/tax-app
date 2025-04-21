import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { Investment } from './entities/investment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Investment])],
    providers: [InvestmentsService],
    controllers: [InvestmentsController],
    exports: [InvestmentsService],
})
export class InvestmentsModule { }