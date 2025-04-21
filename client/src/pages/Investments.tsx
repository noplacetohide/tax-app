"use client"
import underscore from 'underscore.string';
import moment from 'moment';
import { DatePicker } from '@/components/base/DatePicker';
import { Model } from '@/components/base/Model'
import OverviewInfoCard from '@/components/base/OverviewInfoCard';
import { Select } from '@/components/base/Select';
import { Button } from '@/components/ui/button'
import { DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import api from '@/lib/axios';
import { DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import { BadgeDollarSign, Edit2, NotebookText } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { InvestmentType } from '@/types/investment';
import { formatMoney, getInvestmentHoldingType, getInvestmentQuery } from '@/lib/investmentHelpers';
import { Badge } from '@/components/ui/badge';

const INVESTMENT_TYPES = [
    { label: 'Equity', value: 'EQUITY' },
    { label: 'Mutual Fund', value: 'MUTUAL_FUND' },
];
const FORM_INIT_OBJECT = {
    id: '',
    name: "",
    buy_amount: 0,
    sell_amount: 0,
    type: '',
    buy_date: '',
    sell_date: null,
    notes: ''
}
const INIT_PAGINATION_STATE = {
    total: 0,
    limit: 10,
    page: 1,
    totalPages: 0
}

const investmentFormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: 'Investment name is mandatory.' }),
    buy_amount: z.coerce.number().min(1, { message: 'Invalid buy amount.' }),
    sell_amount: z.coerce.number().optional(),
    type: z.string().min(1, { message: 'Investment type is required.' }),
    buy_date: z.string().min(1, { message: 'Start date is required.' }),
    sell_date: z.string().nullable().optional(),
    notes: z.string().optional(),
});

export default function Investments() {
    const [openInvestmentModel, setOpenInvestmentModel] = useState(false);
    const [investments, setInvestments] = useState([]);
    const [pagination, setPagination] = useState(INIT_PAGINATION_STATE);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const form = useForm({
        resolver: zodResolver(investmentFormSchema),
        defaultValues: FORM_INIT_OBJECT,
    });

    const fetchInvestments = async () => {
        try {
            const query = getInvestmentQuery(pagination);
            const { data } = await api.get(`/api/v1/investments?${query}`);
            setInvestments(data?.data || []);
            setPagination(data?.pagination || INIT_PAGINATION_STATE);
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchInvestments();
    }, [pagination.page]);

    async function onSubmit(formState: z.infer<typeof investmentFormSchema>) {
        try {
            setIsButtonDisabled(true);
            if (isEditMode && formState.id) {
                const { id } = formState;
                await api.put(`/api/v1/investments/${id}`, formState);
            } else {
                formState = { ...formState, id: undefined };
                await api.post('/api/v1/investments', formState);
            }

            await fetchInvestments();
            setOpenInvestmentModel(false);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsButtonDisabled(false);
            form.reset(FORM_INIT_OBJECT);
        }
    }

    const renderInvestmentModelHeader = () => {
        return (
            <DialogHeader>
                <DialogTitle className='text-md font-bold'>Manage Investment</DialogTitle>
                <DialogDescription className='text-sm font-medium'>
                    Make changes to your investment here. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
        )
    }

    const renderInvestmentModelBody = () => {
        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-sm">Name*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Investment name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-sm">Type*</FormLabel>
                                        <FormControl>
                                            <Select
                                                labelClassName="label-sm"
                                                placeholder='investment type'
                                                selectLabel='Choose investment'
                                                items={INVESTMENT_TYPES}
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="buy_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-sm">Amount(Buy $)*</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="buy amount"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="sell_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-sm">Amount(Sell $)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="sell amount"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>




                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="buy_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-sm">Start Date*</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                labelClassName="label-sm"
                                                placeholder='Investment start date'
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="sell_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-sm">End Date</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                labelClassName="label-sm"
                                                placeholder='Investment end date'
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="label-sm">Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Investment notes"
                                                {...field}
                                            />
                                        </FormControl>
                                        <p className="text-sm text-muted-foreground">
                                            You can add short notes here for later reference!
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isButtonDisabled}
                            className={isButtonDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                        >
                            <NotebookText />Save Investment
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        )
    }
    const handlePreviousClick = () => {
        if (pagination.page > 1) {
            setPagination({ ...pagination, page: pagination.page - 1 });
        }
    };
    const handleNextClick = () => {
        if (pagination.page < pagination.totalPages) {
            setPagination({ ...pagination, page: pagination.page + 1 });
        }
    }
    const renderAssetTypeCell = (investment: InvestmentType) => {
        const type = getInvestmentHoldingType(investment.buy_date, investment.sell_date)
        { underscore.humanize(getInvestmentHoldingType(investment.buy_date, investment.sell_date)) || '-' }
        if (type != '-')
            return <Badge className={`${'SHORT_TERM' == type ? 'bg-orange-400' : 'bg-green-600'} rounded`}>{underscore.humanize(getInvestmentHoldingType(investment.buy_date, investment.sell_date)) || '-'} </Badge>

        return '-';
    }
    const handleOpenInvestmentEditModel = (investment: InvestmentType) => {
        setIsEditMode(true);
        form.reset({
            ...investment
        });
        setOpenInvestmentModel(true);
    };
    return (
        <div className="p-6">
            <Model
                modelClassName='max-w-[90%] sm:max-w-[90%] md:max-w-[90%] lg:max-w-[80%] xl:md:max-w-[70%]'
                header={renderInvestmentModelHeader()}
                body={renderInvestmentModelBody()}
                open={openInvestmentModel}
                onOpenChange={() => {
                    setOpenInvestmentModel(false);
                    form.reset(FORM_INIT_OBJECT);
                }}
            />
            <div className='flex justify-between items-baseline'>
                <div className="text-lg md:text-xl xl:text-2xl font-bold mb-4">Your investments</div>
                <Button onClick={() => setOpenInvestmentModel(true)}>
                    <BadgeDollarSign />
                    <span className='hidden sm:block'>Investment</span>
                </Button>
            </div>
            <p className='text-sm font-semibold text-gray-600 pb-4'>Manage all your investments.</p>
            <div className="text-md md:text-lg xl:text-xl font-bold mb-4">Investments Overview</div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4'>
                <OverviewInfoCard
                    title='Investment Counts'
                    value={pagination?.total}
                />
            </div>
            <div className="mt-6 bg-white rounded shadow">

                <><div className="p-4 border-b">
                    <h3 className="font-bold">Your Investments</h3>
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
                                        <TableHead>Action</TableHead>
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
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    className='px-2 py-2'
                                                    onClick={() => handleOpenInvestmentEditModel(investment)}
                                                >
                                                    <Edit2 /> Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {!(!!investments?.length) && (
                            <p className='text-center text-xl text-gray-700 font-medium'>No Investment Details</p>
                        )}
                    </div>
                </>

            </div>
        </div >
    )
}