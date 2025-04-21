"use client"
import React, { useEffect, useState } from 'react'
import { z } from 'zod';
import { useForm } from 'react-hook-form';

import OverviewInfoCard from '@/components/base/OverviewInfoCard';
import { Select } from '@/components/base/Select';
import api from '@/lib/axios';
import { zodResolver } from "@hookform/resolvers/zod"
import { formatMoney, getInvestmentQuery } from '@/lib/investmentHelpers';
import InvestmentTableByHoldingType from '@/components/taxes/InvestmentTableByHoldingType';
import FYInvestment from '@/components/taxes/FYInvestment';
import { InvestmentStatsTypes } from '@/types/investment';

const INVESTMENT_TYPES = [
    { label: 'Equity', value: 'EQUITY' },
    { label: 'Mutual Fund', value: 'MUTUAL_FUND' },
];
const INVESTMENT_YEARS = [
    { label: 'FY-2025', value: '2025' },
    { label: 'FY-2024', value: '2024' },
    { label: 'FY-2023', value: '2023' },
    { label: 'FY-2022', value: '2022' },
    { label: 'FY-2021', value: '2021' },
]
const INIT_PAGINATION_STATE = {
    total: 0,
    limit: 10,
    page: 1,
    totalPages: 0
}

const investmentFormSchema = z.object({
    name: z.string().min(1, { message: 'Investment name is mandatory.' }),
    buy_amount: z.coerce.number().min(1, { message: 'Invalid buy amount.' }),
    sell_amount: z.coerce.number().optional(),
    type: z.string().min(1, { message: 'Investment type is required.' }),
    buy_date: z.string().min(1, { message: 'Start date is required.' }),
    sell_date: z.string().nullable().optional(),
    notes: z.string().optional(),
});
const STATS_INIT = {
    "short_term": {
        "buy": 0,
        "sell": 0,
        "short_term_net_income": 0,
        "tax": 0
    },
    "long_term": {
        "buy": 0,
        "sell": 0,
        "long_term_net_income": 0,
        "tax": 0
    }
}
export default function Taxes() {
    const [investment, setInvestment] = useState<InvestmentStatsTypes>(STATS_INIT);
    const [pagination, setPagination] = useState(INIT_PAGINATION_STATE);
    const [filters, setFilters] = useState({ fy: '2025' });

    const fetchInvestments = async () => {
        try {
            const { data } = await api.get(`api/v1/investments/investment-stats`);
            setInvestment(data);
        } catch (error) {
            console.error(error)
        }
    }


    useEffect(() => {
        fetchInvestments();
    }, [pagination.page, filters.fy]);

    return (
        <div className="p-6">

            <div className='flex justify-between items-baseline'>
                <div className="text-lg md:text-xl xl:text-2xl font-bold mb-4">Your Taxes</div>
                <Select
                    selectBtnClassNames='bg-black text-white'
                    labelClassName="label-sm"
                    placeholder='Choose Financial Year'
                    selectLabel='Choose Year'
                    items={INVESTMENT_YEARS}
                    value={filters.fy}
                    onChange={(value) => setFilters({ ...filters, fy: value })}
                >
                </Select>

            </div>
            <p className='text-sm font-semibold text-gray-600 pb-4'>Overview of taxes on all your investments. Financial year starts on 1st Jan and ends on 31st Dec.</p>
            <div className="text-md md:text-lg xl:text-xl font-bold mb-4">Taxes Overview</div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4'>
                <OverviewInfoCard
                    title='Investment Counts'
                    value={pagination?.total}
                    description={`This count is for the FY-${filters.fy}`}
                />
                <OverviewInfoCard
                    title='Short Term Tax'
                    value={investment?.short_term?.tax ?? '-'}
                    description={`${investment?.short_term?.tax}Your total buy value is ${formatMoney(investment?.short_term?.buy)}, sell value is ${formatMoney(investment?.short_term?.sell)}, and net gain is ${formatMoney(investment?.short_term?.short_term_net_income)}`}
                />
                <OverviewInfoCard
                    title='Long Term Tax'
                    value={investment?.long_term?.tax ?? '-'}
                    description={`${investment?.long_term?.tax}Your total buy value is ${formatMoney(investment?.long_term?.buy)}, sell value is ${formatMoney(investment?.long_term?.sell)}, and net gain is ${formatMoney(investment?.long_term?.long_term_net_income)}`}
                />
            </div>
            <FYInvestment fy={filters.fy} title={`Your Investments FY-[${filters.fy}]`} />
            <InvestmentTableByHoldingType holdingType='LONG_TERM' title="Your Long Term Investments" />
            <InvestmentTableByHoldingType holdingType='SHORT_TERM' title="Your Short Term Investments" />
        </div >
    )
}