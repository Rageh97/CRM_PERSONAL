'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, calculatePercentageChange, getArabicMonth } from '@/lib/utils';
import { getPeriodFinancialMetrics, type FinancialPeriodMetrics } from '@/features/comparisons/actions';

type ComparisonMode = 'DAYS' | 'RANGES' | 'MONTHS' | 'YEARS';

export function ComparisonsClient({ monthlyData }: { monthlyData: any[] }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Yesterday Date string
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const [mode, setMode] = useState<ComparisonMode>('MONTHS');
  const [loading, setLoading] = useState(false);

  // Day mode
  const [day1, setDay1] = useState(yesterdayStr);
  const [day2, setDay2] = useState(todayStr);

  // Range mode
  const [range1Start, setRange1Start] = useState(new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]);
  const [range1End, setRange1End] = useState(new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]);
  const [range2Start, setRange2Start] = useState(new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]);
  const [range2End, setRange2End] = useState(todayStr);

  // Month mode
  const [month1, setMonth1] = useState(String(Math.max(currentMonth - 1, 0)));
  const [month2, setMonth2] = useState(String(currentMonth));

  // Year mode
  const [year1, setYear1] = useState(String(currentYear - 1));
  const [year2, setYear2] = useState(String(currentYear));

  // Metrics states
  const [metrics1, setMetrics1] = useState<FinancialPeriodMetrics>({
    revenue: 0, expense: 0, returns: 0, salary: 0, netProfit: 0, count: 0,
  });
  const [metrics2, setMetrics2] = useState<FinancialPeriodMetrics>({
    revenue: 0, expense: 0, returns: 0, salary: 0, netProfit: 0, count: 0,
  });
  const [label1, setLabel1] = useState('');
  const [label2, setLabel2] = useState('');

  // Fetch comparison data dynamically
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (mode === 'DAYS') {
          const m1 = await getPeriodFinancialMetrics(day1, day1);
          const m2 = await getPeriodFinancialMetrics(day2, day2);
          setMetrics1(m1);
          setMetrics2(m2);
          setLabel1(`يوم ${day1}`);
          setLabel2(`يوم ${day2}`);
        } else if (mode === 'RANGES') {
          const m1 = await getPeriodFinancialMetrics(range1Start, range1End);
          const m2 = await getPeriodFinancialMetrics(range2Start, range2End);
          setMetrics1(m1);
          setMetrics2(m2);
          setLabel1(`من ${range1Start} إلى ${range1End}`);
          setLabel2(`من ${range2Start} إلى ${range2End}`);
        } else if (mode === 'MONTHS') {
          const idx1 = parseInt(month1);
          const idx2 = parseInt(month2);
          const d1 = monthlyData[idx1] || { revenue: 0, expense: 0, returns: 0, salary: 0 };
          const d2 = monthlyData[idx2] || { revenue: 0, expense: 0, returns: 0, salary: 0 };
          
          setMetrics1({
            revenue: d1.revenue,
            expense: d1.expense,
            returns: d1.returns,
            salary: d1.salary,
            netProfit: d1.revenue - d1.expense - d1.returns - d1.salary,
            count: 0,
          });
          setMetrics2({
            revenue: d2.revenue,
            expense: d2.expense,
            returns: d2.returns,
            salary: d2.salary,
            netProfit: d2.revenue - d2.expense - d2.returns - d2.salary,
            count: 0,
          });
          setLabel1(getArabicMonth(idx1));
          setLabel2(getArabicMonth(idx2));
        } else if (mode === 'YEARS') {
          const startY1 = `${year1}-01-01`;
          const endY1 = `${year1}-12-31`;
          const startY2 = `${year2}-01-01`;
          const endY2 = `${year2}-12-31`;

          const m1 = await getPeriodFinancialMetrics(startY1, endY1);
          const m2 = await getPeriodFinancialMetrics(startY2, endY2);
          setMetrics1(m1);
          setMetrics2(m2);
          setLabel1(`سنة ${year1}`);
          setLabel2(`سنة ${year2}`);
        }
      } catch (err) {
        console.error('Error fetching comparison:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [mode, day1, day2, range1Start, range1End, range2Start, range2End, month1, month2, year1, year2, monthlyData]);

  // Financial Items
  const items = [
    {
      key: 'revenue',
      label: 'الإيرادات',
      v1: metrics1.revenue,
      v2: metrics2.revenue,
      change: calculatePercentageChange(metrics2.revenue, metrics1.revenue),
      isGoodWhenHigher: true,
      color: 'emerald',
    },
    {
      key: 'expense',
      label: 'النفقات',
      v1: metrics1.expense,
      v2: metrics2.expense,
      change: calculatePercentageChange(metrics2.expense, metrics1.expense),
      isGoodWhenHigher: false,
      color: 'rose',
    },
    {
      key: 'returns',
      label: 'المسترجعات',
      v1: metrics1.returns,
      v2: metrics2.returns,
      change: calculatePercentageChange(metrics2.returns, metrics1.returns),
      isGoodWhenHigher: false,
      color: 'amber',
    },
    {
      key: 'salary',
      label: 'رواتب الموظفين',
      v1: metrics1.salary,
      v2: metrics2.salary,
      change: calculatePercentageChange(metrics2.salary, metrics1.salary),
      isGoodWhenHigher: false,
      color: 'purple',
    },
    {
      key: 'netProfit',
      label: 'صافي الربح',
      v1: metrics1.netProfit,
      v2: metrics2.netProfit,
      change: calculatePercentageChange(metrics2.netProfit, metrics1.netProfit),
      isGoodWhenHigher: true,
      color: 'blue',
    },
  ];

  const netProfitChange = calculatePercentageChange(metrics2.netProfit, metrics1.netProfit);
  const isNetProfitPositive = netProfitChange >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">مركز المقارنات المالية والتحليل الذكي</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          قارن بين أي يومين، فترتين، شهرين أو سنتين واستعرض الأداء المالي التنفيذي
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            onClick={() => setMode('DAYS')}
            className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${
              mode === 'DAYS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📅 مقارنة بالأيام (يوم/يوم)
          </button>
          <button
            onClick={() => setMode('RANGES')}
            className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${
              mode === 'RANGES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📆 مقارنة بنطاق فترتين
          </button>
          <button
            onClick={() => setMode('MONTHS')}
            className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${
              mode === 'MONTHS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🗓️ مقارنة بالشهور
          </button>
          <button
            onClick={() => setMode('YEARS')}
            className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${
              mode === 'YEARS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📈 مقارنة بالسنوات
          </button>
        </div>
      </div>

      {/* Dynamic Controls Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        
        {/* Mode 1: Days */}
        {mode === 'DAYS' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اليوم الأول (الفترة 1)</label>
              <input
                type="date"
                value={day1}
                onChange={(e) => setDay1(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اليوم الثاني (الفترة 2)</label>
              <input
                type="date"
                value={day2}
                onChange={(e) => setDay2(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        )}

        {/* Mode 2: Ranges */}
        {mode === 'RANGES' && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-md border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">الفترة الأولى (البداية والنهاية)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">من تاريخ</label>
                  <input
                    type="date"
                    value={range1Start}
                    onChange={(e) => setRange1Start(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">إلى تاريخ</label>
                  <input
                    type="date"
                    value={range1End}
                    onChange={(e) => setRange1End(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-md border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">الفترة الثانية (البداية والنهاية)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">من تاريخ</label>
                  <input
                    type="date"
                    value={range2Start}
                    onChange={(e) => setRange2Start(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">إلى تاريخ</label>
                  <input
                    type="date"
                    value={range2End}
                    onChange={(e) => setRange2End(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode 3: Months */}
        {mode === 'MONTHS' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الشهر الأول (الفترة 1)</label>
              <select
                value={month1}
                onChange={(e) => setMonth1(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={String(i)}>{getArabicMonth(i)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الشهر الثاني (الفترة 2)</label>
              <select
                value={month2}
                onChange={(e) => setMonth2(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={String(i)}>{getArabicMonth(i)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Mode 4: Years */}
        {mode === 'YEARS' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">السنة الأولى (الفترة 1)</label>
              <input
                type="number"
                min="2020"
                max="2035"
                value={year1}
                onChange={(e) => setYear1(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">السنة الثانية (الفترة 2)</label>
              <input
                type="number"
                min="2020"
                max="2035"
                value={year2}
                onChange={(e) => setYear2(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay or Results */}
      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <p className="text-xs font-semibold text-slate-500 animate-pulse">جاري جلب وتحليل البيانات المالية للمقارنة...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Hero KPI Comparison Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Period 1 Net Profit */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الفترة الأولى ({label1})</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold">
                  {metrics1.count > 0 ? `${metrics1.count} فاتورة` : 'فترة أساسية'}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(metrics1.netProfit)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">صافي الربح للفترة الأولى</p>
            </div>

            {/* Period 2 Net Profit & Comparison Badge */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الفترة الثانية ({label2})</span>
                {netProfitChange !== 0 && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border ${
                    isNetProfitPositive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {isNetProfitPositive ? '↑' : '↓'} {Math.abs(netProfitChange).toFixed(1)}% {isNetProfitPositive ? 'نمو الأرباح' : 'تراجع الأرباح'}
                  </span>
                )}
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(metrics2.netProfit)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">صافي الربح للفترة المقارنة</p>
            </div>
          </div>

          {/* Luxurious Breakdown Table with Visual Ratio Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">جدول التحليل المالي التفصيلي</h3>
              <span className="text-[11px] text-slate-500 font-semibold">{label1} ⚡️ {label2}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold uppercase">
                    <th className="p-3.5">البند المالي</th>
                    <th className="p-3.5">{label1}</th>
                    <th className="p-3.5">{label2}</th>
                    <th className="p-3.5 text-center">نسبة التغير (%)</th>
                    <th className="p-3.5 text-center min-w-[140px]">مؤشر النسبة البصري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((item) => {
                    const isPositiveChange = item.isGoodWhenHigher ? item.change >= 0 : item.change <= 0;
                    const maxVal = Math.max(Math.abs(item.v1), Math.abs(item.v2), 1);
                    const pct1 = Math.min(Math.round((Math.abs(item.v1) / maxVal) * 100), 100);
                    const pct2 = Math.min(Math.round((Math.abs(item.v2) / maxVal) * 100), 100);

                    return (
                      <tr key={item.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        
                        {/* Item Name */}
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {item.label}
                        </td>

                        {/* Period 1 Value */}
                        <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                          {formatCurrency(item.v1)}
                        </td>

                        {/* Period 2 Value */}
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.v2)}
                        </td>

                        {/* Percentage Change */}
                        <td className="p-3.5 text-center">
                          {item.v1 === 0 && item.v2 === 0 ? (
                            <span className="text-slate-400 font-semibold">—</span>
                          ) : (
                            <span className={`inline-block px-2.5 py-0.5 rounded font-extrabold text-[11px] border ${
                              isPositiveChange
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            }`}>
                              {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                            </span>
                          )}
                        </td>

                        {/* Visual Progress Bar */}
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-slate-400 dark:bg-slate-500 h-full rounded-full" style={{ width: `${pct1}%` }} />
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct2}%` }} />
                            </div>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Executive Analysis Report */}
          <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 space-y-2 shadow-sm">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              📊 التقرير المالي التنفيذي المقارن
            </h3>
            <div className="text-xs text-slate-300 leading-relaxed space-y-1.5 pt-1">
              <p>
                • عند مقارنة <strong className="text-white">{label2}</strong> مع <strong className="text-white">{label1}</strong>، يظهر أن إجمالي الإيرادات سجلت {metrics2.revenue >= metrics1.revenue ? 'زيادة' : 'انخفاضاً'} قدره {formatCurrency(Math.abs(metrics2.revenue - metrics1.revenue))}.
              </p>
              <p>
                • إجمالي النفقات التراكمية (شاملة الرواتب والمسترجعات) شهدت {metrics2.expense + metrics2.returns + metrics2.salary >= metrics1.expense + metrics1.returns + metrics1.salary ? 'ارتفاعاً' : 'انخفاضاً'} بنسبة {Math.abs(calculatePercentageChange(metrics2.expense + metrics2.returns + metrics2.salary, metrics1.expense + metrics1.returns + metrics1.salary)).toFixed(1)}%.
              </p>
              <p className="font-bold text-emerald-400">
                • النتيجة النهائية: صافي الربح في {label2} بلغ {formatCurrency(metrics2.netProfit)} بالمقارنة مع {formatCurrency(metrics1.netProfit)} في {label1}.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
