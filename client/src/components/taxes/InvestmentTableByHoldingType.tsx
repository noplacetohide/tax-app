import React, { useEffect, useState } from 'react'
import underscore from 'underscore.string';
import { formatMoney, getInvestmentHoldingType, getInvestmentQuery } from '@/lib/investmentHelpers'
import { InvestmentType } from '@/types/investment'
import moment from 'moment'
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '../ui/pagination'
import api from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
const INIT_PAGINATION_STATE = {
    total: 0,
    limit: 10,
    page: 1,
    totalPages: 0
}

type InvestmentTableByHoldingTypes = {
    holdingType: "SHORT_TERM" | "LONG_TERM"
    title?: string
}

export default function InvestmentTableByHoldingType({ holdingType, title }: InvestmentTableByHoldingTypes) {
    const [investments, setInvestments] = useState([]);
    const [pagination, setPagination] = useState(INIT_PAGINATION_STATE);
    const fetchInvestments = async () => {
        try {
            const query = getInvestmentQuery(pagination);
            const { data } = await api.get(`/api/v1/investments/investment-by-holding-time?holding_type=${holdingType}`);
            setInvestments(data?.data || []);
            setPagination(data?.pagination || INIT_PAGINATION_STATE);
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        fetchInvestments();
    }, [pagination.page]);

    const handlePreviousClick = () => {
        if (pagination.page > 1) {
            setPagination({ ...pagination, page: pagination.page - 1 });
        }

    };
    const handleNextClick = () => {
        if ((pagination.page < pagination.totalPages)) {
            setPagination({ ...pagination, page: pagination.page + 1 })
        }
    }
    const renderAssetTypeCell = (investment: InvestmentType) => {
        const type = getInvestmentHoldingType(investment.buy_date, investment.sell_date)
        if (type != '-')
            return <Badge className={`${'SHORT_TERM' == type ? 'bg-orange-400' : 'bg-green-600'} rounded`}>{underscore.humanize(type) || '-'} </Badge>

        return '-';
    }

    return (
        <div className="mt-6 bg-white rounded shadow">
            <div className="p-4 border-b">
                <h3 className="font-bold">{title}</h3>
            </div>
            <div className="p-4">
                {(!!investments?.length) && (
                    <Table>
                        <TableCaption>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious className={pagination.page == 1 ? 'cursor-not-allowed' : 'cursor-pointer'} onClick={() => handlePreviousClick()} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink isActive>
                                            {pagination.page}
                                        </PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext className={pagination.page >= pagination.totalPages ? 'cursor-not-allowed' : 'cursor-pointer'} onClick={() => handleNextClick()} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Buy Amount</TableHead>
                                <TableHead>Buy Date</TableHead>
                                <TableHead>Sell Amount</TableHead>
                                <TableHead>Sell Date</TableHead>
                                <TableHead>Investment Type</TableHead>
                                <TableHead>Asset Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {investments.map((investment: InvestmentType, index: number) => (
                                <TableRow key={investment.id} className='text-sm'>
                                    <TableCell className='text-sm'>{index + 1}</TableCell>
                                    <TableCell className='text-sm'>{investment?.name || '-'}</TableCell>
                                    <TableCell>{formatMoney(investment?.buy_amount) || '-'}</TableCell>
                                    <TableCell>{investment?.buy_date ? moment(investment?.buy_date).format('ll') : '-'}</TableCell>
                                    <TableCell>{formatMoney(investment?.sell_amount) || '-'}</TableCell>
                                    <TableCell>{investment?.sell_date ? moment(investment?.sell_date).format('ll') : '-'}</TableCell>
                                    <TableCell>{underscore.humanize(investment.type) || '-'}</TableCell>
                                    <TableCell>{renderAssetTypeCell(investment)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                {!(!!investments?.length) && (
                    <p className='text-center text-xl text-gray-700 font-medium'>No Investment Details</p>
                )}
            </div>
        </div>
    )
}

