"use client"
import React, { useEffect, useState } from 'react'

import OverviewInfoCard from '@/components/base/OverviewInfoCard';
import { Select } from '@/components/base/Select';
import api from '@/lib/axios';
import { formatMoney } from '@/lib/investmentHelpers';
import InvestmentTableByHoldingType from '@/components/taxes/InvestmentTableByHoldingType';
import FYInvestment from '@/components/taxes/FYInvestment';
import { InvestmentStatsTypes } from '@/types/investment';
import ShortTermTaxInfo from '@/components/taxes/TaxInfo';
import LongTermTaxInfo from '@/components/taxes/LongTermTaxInfo';
import TaxInfo from '@/components/taxes/TaxInfo';

const INVESTMENT_YEARS = [
    { label: 'FY-2025', value: '2025' },
    { label: 'FY-2024', value: '2024' },
    { label: 'FY-2023', value: '2023' },
    { label: 'FY-2022', value: '2022' },
    { label: 'FY-2021', value: '2021' },
]

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
    },
    "fyCount": 0
}
export default function Taxes() {
    const [investment, setInvestment] = useState<InvestmentStatsTypes>(STATS_INIT);
    const [filters, setFilters] = useState({ fy: '2025' });

    const fetchInvestments = async () => {
        try {
            const { data } = await api.get(`api/v1/investments/investment-stats?fy=${filters.fy}`);
            setInvestment(data);
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchInvestments();
    }, [filters.fy]);

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
                    value={investment?.fyCount || '-'}
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
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <TaxInfo type="SHORT_TERM" title='Ordinary Income Tax Rates (Short Term Tax)' />
                <TaxInfo type='LONG_TERM' title='Long-Term Capital Gains Tax Rates' />
            </div>
        </div >
    )
}