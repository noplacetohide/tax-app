export type InvestmentType = {
    id: string;
    name: string;
    buy_amount: number;
    sell_amount: number;
    type: 'MUTUAL_FUND' | 'EQUITY' | 'OTHER';
    buy_date: string;
    sell_date: string | null;
    notes: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
};
