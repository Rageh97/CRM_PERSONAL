'use client';

import { useState } from 'react';
import { formatCurrency, getArabicMonth, calculatePercentageChange } from '@/lib/utils';
import type { MonthlyData } from '@/lib/types';

export function ComparisonsClient({ monthlyData }: { monthlyData: MonthlyData[] }) {
  const currentMonth = new Date().getMonth();
  const [period1, setPeriod1] = useState(String(Math.max(currentMonth - 1, 0)));
  const [period2, setPeriod2] = useState(String(currentMonth));

  const data1 = monthlyData[parseInt(period1)] || { revenue: 0, expense: 0, returns: 0, salary: 0 };
  const data2 = monthlyData[parseInt(period2)] || { revenue: 0, expense: 0, returns: 0, salary: 0 };

  const net1 = data1.revenue - data1.expense - data1.returns - data1.salary;
  const net2 = data2.revenue - data2.expense - data2.returns - data2.salary;

  const comparisons = [
    { label: 'الإيرادات', v1: data1.revenue, v2: data2.revenue, change: calculatePercentageChange(data2.revenue, data1.revenue), good: true },
    { label: 'النفقات', v1: data1.expense, v2: data2.expense, change: calculatePercentageChange(data2.expense, data1.expense), good: false },
    { label: 'المسترجعات', v1: data1.returns, v2: data2.returns, change: calculatePercentageChange(data2.returns, data1.returns), good: false },
    { label: 'الرواتب', v1: data1.salary, v2: data2.salary, change: calculatePercentageChange(data2.salary, data1.salary), good: false },
    { label: 'صافي الربح', v1: net1, v2: net2, change: calculatePercentageChange(net2, net1), good: true },
  ];

  // Auto-generate summary
  const generateSummary = () => {
    const parts: string[] = [];
    comparisons.forEach(c => {
      if (c.change === 0 || (c.v1 === 0 && c.v2 === 0)) return;
      const direction = c.change > 0 ? 'زادت' : 'انخفضت';
      const quality = c.good ? (c.change > 0 ? '✅' : '⚠️') : (c.change > 0 ? '⚠️' : '✅');
      parts.push(`${c.label} ${direction} بنسبة ${Math.abs(c.change).toFixed(1)}% ${quality}`);
    });
    return parts.length > 0 ? parts.join(' • ') : 'لا توجد بيانات كافية للمقارنة';
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">المقارنات</h1>
        <p className="text-sm text-text-muted mt-1">قارن بين أي فترتين</p>
      </div>

      {/* Period Selection */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-card">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">الفترة الأولى</label>
            <select value={period1} onChange={(e) => setPeriod1(e.target.value)}
              className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
              {Array.from({length: 12}, (_, i) => (
                <option key={i} value={String(i)}>{getArabicMonth(i)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">الفترة الثانية</label>
            <select value={period2} onChange={(e) => setPeriod2(e.target.value)}
              className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
              {Array.from({length: 12}, (_, i) => (
                <option key={i} value={String(i)}>{getArabicMonth(i)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="grid grid-cols-4 gap-0 text-xs font-medium text-text-muted bg-surface-secondary p-3 border-b border-border">
          <span>البند</span>
          <span className="text-center">{getArabicMonth(parseInt(period1))}</span>
          <span className="text-center">{getArabicMonth(parseInt(period2))}</span>
          <span className="text-center">التغيّر</span>
        </div>
        {comparisons.map((c, idx) => {
          const isPositive = c.good ? c.change >= 0 : c.change <= 0;
          return (
            <div key={idx} className="grid grid-cols-4 gap-0 text-sm p-3 border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
              <span className="font-medium text-text-primary">{c.label}</span>
              <span className="text-center text-text-secondary">{formatCurrency(c.v1)}</span>
              <span className="text-center text-text-secondary">{formatCurrency(c.v2)}</span>
              <span className={`text-center font-semibold ${c.v1 === 0 && c.v2 === 0 ? 'text-text-muted' : isPositive ? 'text-success' : 'text-danger'}`}>
                {c.v1 === 0 && c.v2 === 0 ? '-' : `${c.change > 0 ? '+' : ''}${c.change.toFixed(1)}%`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Auto Summary */}
      <div className="bg-primary-50 border border-primary/20 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-primary mb-2">📊 ملخص المقارنة</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{generateSummary()}</p>
      </div>
    </div>
  );
}
