import { formatMoney } from '@/lib/investmentHelpers'
import { TaxBracket } from '@/types/investment'

import React from 'react'
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '../ui/table'
import { LONG_TERM_TAX_SLAB, SHORT_TERM_TAX_SLAB } from '@/constants/investments'

export default function TaxInfo({ title, type }: { title: string, type: 'SHORT_TERM' | 'LONG_TERM' }) {
    const slabs = type === 'SHORT_TERM' ? SHORT_TERM_TAX_SLAB : LONG_TERM_TAX_SLAB;
    const getTaxRates = () => {

    }
    return (
        <div className="mt-6 bg-white rounded shadow">
            <div className="p-4 border-b">
                <h3 className="font-bold">{title}</h3>
            </div>
            <div className="p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Tax Rate</TableHead>
                            <TableHead>Range</TableHead>

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {slabs?.map((tax: TaxBracket, index: number) => (
                            <TableRow key={index} className='text-sm'>
                                <TableCell className='text-sm'>{index + 1}</TableCell>
                                <TableCell className='text-sm'>{tax?.tax_rate || '-'}</TableCell>
                                <TableCell className='text-sm'>
                                    {formatMoney(tax.single_filer.min_income)} - {tax.single_filer.max_income !== null ? formatMoney(tax.single_filer.max_income) : 'and above'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
