'use client';

import { useState } from 'react';
import { StatCard, RecentInvoicesList, BestWorstCard } from '@/features/dashboard/components';
import { MonthlyChart } from '@/features/dashboard/Chart';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats, MonthlyData, BestWorstMonth } from '@/lib/types';

interface DashboardClientProps {
  stats: DashboardStats;
  monthlyData: MonthlyData[];
  recentInvoices: any[];
  bestWorst: BestWorstMonth;
}

export function DashboardClient({ stats, monthlyData, recentInvoices, bestWorst }: DashboardClientProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">لوحة التحكم</h1>
        <p className="text-sm text-text-muted mt-1">نظرة عامة على الوضع المالي</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 stagger-children">
        <StatCard
          title="إجمالي الإيرادات"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          color="revenue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
        />
        <StatCard
          title="إجمالي النفقات"
          value={stats.totalExpense}
          change={stats.expenseChange}
          color="expense"
          invertChange
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
            </svg>
          }
        />
        <StatCard
          title="المسترجعات"
          value={stats.totalReturn}
          change={stats.returnChange}
          color="return"
          invertChange
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          }
        />
        <StatCard
          title="رواتب الموظفين"
          value={stats.totalSalary}
          change={stats.salaryChange}
          color="salary"
          invertChange
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          title="صافي الربح"
          value={stats.netProfit}
          change={0}
          color="primary"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="عدد الفواتير"
          value={stats.invoiceCount}
          change={0}
          color="primary"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text-primary">الإحصائيات الشهرية</h2>
          <div className="flex bg-surface-secondary rounded-lg p-0.5">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                chartType === 'bar'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              أعمدة
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                chartType === 'line'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              خطوط
            </button>
          </div>
        </div>
        <MonthlyChart data={monthlyData} type={chartType} />
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text-primary">آخر الفواتير</h2>
            <a href="/dashboard/invoices" className="text-xs text-primary font-medium hover:underline">
              عرض الكل
            </a>
          </div>
          <RecentInvoicesList invoices={recentInvoices} />
        </div>

        {/* Best/Worst */}
        <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-card">
          <h2 className="text-base font-bold text-text-primary mb-3">أداء الشهور</h2>
          <BestWorstCard best={bestWorst.best} worst={bestWorst.worst} />

          {/* Quick Summary */}
          <div className="mt-4 p-3 bg-surface-secondary rounded-xl">
            <p className="text-xs text-text-muted mb-1">ملخص سريع</p>
            <p className="text-sm text-text-secondary">
              {stats.netProfit >= 0
                ? `صافي الربح هذا الشهر ${formatCurrency(stats.netProfit)} ✨`
                : `خسارة هذا الشهر ${formatCurrency(Math.abs(stats.netProfit))} ⚠️`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
