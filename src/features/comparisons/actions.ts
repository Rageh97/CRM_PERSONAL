'use server';

import { prisma } from '@/lib/prisma';
import { calculatePercentageChange } from '@/lib/utils';

export interface FinancialPeriodMetrics {
  revenue: number;
  expense: number;
  returns: number;
  salary: number;
  netProfit: number;
  count: number;
}

export async function getPeriodFinancialMetrics(
  startDateStr: string,
  endDateStr: string
): Promise<FinancialPeriodMetrics> {
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDateStr);
  end.setHours(23, 59, 59, 999);

  const invoices = await prisma.invoice.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  const sum = (cat: string) =>
    invoices.filter((i) => i.category === cat).reduce((acc, i) => acc + i.amount, 0);

  const revenue = sum('REVENUE');
  const expense = sum('EXPENSE');
  const returns = sum('RETURN');
  const salary = sum('SALARY');
  const netProfit = revenue - expense - returns - salary;

  return {
    revenue,
    expense,
    returns,
    salary,
    netProfit,
    count: invoices.length,
  };
}
