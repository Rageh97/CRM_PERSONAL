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
}

const colorMap = {
  revenue: { bg: 'bg-revenue-bg', text: 'text-revenue', border: 'border-revenue/20' },
  expense: { bg: 'bg-expense-bg', text: 'text-expense', border: 'border-expense/20' },
  return: { bg: 'bg-return-bg', text: 'text-return', border: 'border-return/20' },
  salary: { bg: 'bg-salary-bg', text: 'text-salary', border: 'border-salary/20' },
  primary: { bg: 'bg-primary-50', text: 'text-primary', border: 'border-primary/20' },
};

export function StatCard({ title, value, change, currency = 'SAR', icon, color, invertChange }: StatCardProps) {
  const colors = colorMap[color];
  const isPositive = invertChange ? change <= 0 : change >= 0;
  const changeColor = isPositive ? 'text-success' : 'text-danger';
  const changeBg = isPositive ? 'bg-success-bg' : 'bg-danger-bg';

  return (
    <div className={`bg-surface rounded-2xl border ${colors.border} p-4 sm:p-5 shadow-card hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center`}>
          <span className={colors.text}>{icon}</span>
        </div>
        {change !== 0 && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${changeBg} ${changeColor}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-xs text-text-muted mb-1">{title}</p>
      <p className="text-lg sm:text-xl font-bold text-text-primary">{formatCurrency(value, currency)}</p>
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
  date: Date | string;
  createdBy: { name: string };
}

const categoryDot: Record<string, string> = {
  REVENUE: 'bg-revenue',
  EXPENSE: 'bg-expense',
  RETURN: 'bg-return',
  SALARY: 'bg-salary',
};

export function RecentInvoicesList({ invoices }: { invoices: RecentInvoice[] }) {
  if (!invoices.length) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        لا توجد فواتير بعد
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invoices.map((inv, idx) => (
        <div
          key={inv.id}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${categoryDot[inv.category] || 'bg-primary'}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{inv.name}</p>
              <p className="text-xs text-text-muted">{CATEGORY_LABELS[inv.category]} • {inv.invoiceNumber}</p>
            </div>
          </div>
          <div className="text-end flex-shrink-0 ms-3">
            <p className={`text-sm font-semibold ${inv.category === 'REVENUE' ? 'text-revenue' : inv.category === 'EXPENSE' || inv.category === 'SALARY' ? 'text-expense' : 'text-return'}`}>
              {inv.category === 'REVENUE' ? '+' : '-'}{formatCurrency(inv.amount, inv.currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// BestWorstMonths Card
// ═══════════════════════════════════════

interface BestWorstProps {
  best: { month: string; amount: number };
  worst: { month: string; amount: number };
}

export function BestWorstCard({ best, worst }: BestWorstProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-success-bg/50 border border-success/20 rounded-xl p-4 text-center">
        <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
          </svg>
        </div>
        <p className="text-xs text-text-muted mb-1">أفضل شهر</p>
        <p className="font-bold text-success text-sm">{best.month}</p>
        <p className="text-xs text-text-secondary mt-0.5">{formatCurrency(best.amount)}</p>
      </div>
      <div className="bg-danger-bg/50 border border-danger/20 rounded-xl p-4 text-center">
        <div className="w-8 h-8 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-4 h-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </div>
        <p className="text-xs text-text-muted mb-1">أسوأ شهر</p>
        <p className="font-bold text-danger text-sm">{worst.month}</p>
        <p className="text-xs text-text-secondary mt-0.5">{formatCurrency(worst.amount)}</p>
      </div>
    </div>
  );
}
