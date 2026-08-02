'use client';

import { formatCurrency, CATEGORY_LABELS } from '@/lib/utils';

// ═══════════════════════════════════════
// StatCard Component
// ═══════════════════════════════════════

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  currency?: string;
  icon: React.ReactNode;
  color: 'revenue' | 'expense' | 'return' | 'salary' | 'primary';
  invertChange?: boolean; // For expenses, decrease is good
  isCount?: boolean; // If true, render plain integer count
}

const colorMap = {
  revenue: { bg: 'bg-revenue-bg', text: 'text-revenue', border: 'border-revenue/20' },
  expense: { bg: 'bg-expense-bg', text: 'text-expense', border: 'border-expense/20' },
  return: { bg: 'bg-return-bg', text: 'text-return', border: 'border-return/20' },
  salary: { bg: 'bg-salary-bg', text: 'text-salary', border: 'border-salary/20' },
  primary: { bg: 'bg-primary-50', text: 'text-primary', border: 'border-primary/20' },
};

export function StatCard({ title, value, change, currency = 'SAR', icon, color, invertChange, isCount }: StatCardProps) {
  const colors = colorMap[color];
  const isPositive = invertChange ? change <= 0 : change >= 0;
  const changeColor = isPositive ? 'text-success' : 'text-danger';
  const changeBg = isPositive ? 'bg-success-bg' : 'bg-danger-bg';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 ${colors.bg} rounded-md flex items-center justify-center`}>
          <span className={colors.text}>{icon}</span>
        </div>
        {change !== 0 && (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${changeBg} ${changeColor}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
        {isCount ? value : formatCurrency(value, currency)}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════
// RecentInvoiceCard
// ═══════════════════════════════════════

interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  createdBy?: { name: string };
}

export function RecentInvoicesList({ invoices }: { invoices: RecentInvoice[] }) {
  if (!invoices || invoices.length === 0) {
    return <div className="text-center py-8 text-slate-500 text-xs">لا توجد فواتير مؤخراً</div>;
  }

  const categoryColor: Record<string, string> = {
    REVENUE: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    EXPENSE: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
    RETURN: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    SALARY: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
  };

  return (
    <div className="space-y-2">
      {invoices.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 text-xs transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${categoryColor[inv.category]}`}>
              {CATEGORY_LABELS[inv.category] || inv.category}
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{inv.name}</p>
              <p className="text-[10px] text-slate-500 font-mono" dir="ltr">{inv.invoiceNumber}</p>
            </div>
          </div>
          <div className="text-left font-bold text-slate-900 dark:text-white">
            {formatCurrency(inv.amount, inv.currency)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// BestWorstCard
// ═══════════════════════════════════════

interface BestWorstCardProps {
  best: { month: string; amount: number };
  worst: { month: string; amount: number };
}

export function BestWorstCard({ best, worst }: BestWorstCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-md border border-emerald-200 dark:border-emerald-900">
        <p className="text-emerald-700 dark:text-emerald-400 font-bold mb-1">أفضل شهر (أعلى ربح)</p>
        <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">{best.month}</p>
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">{formatCurrency(best.amount)}</p>
      </div>

      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-md border border-rose-200 dark:border-rose-900">
        <p className="text-rose-700 dark:text-rose-400 font-bold mb-1">أقل شهر (أدنى أرباح)</p>
        <p className="text-sm font-extrabold text-rose-900 dark:text-rose-200">{worst.month}</p>
        <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-1">{formatCurrency(worst.amount)}</p>
      </div>
    </div>
  );
}
