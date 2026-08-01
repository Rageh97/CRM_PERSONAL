'use client';

import { useState } from 'react';
import { formatCurrency, CATEGORY_LABELS, formatShortDate, CURRENCY_LABELS } from '@/lib/utils';

export function ReportsClient({ invoices }: { invoices: any[] }) {
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const filtered = invoices.filter((inv) => {
    const d = new Date(inv.date);
    const matchCat = !category || inv.category === category;
    const matchMonth = d.getMonth() + 1 === parseInt(month);
    const matchYear = d.getFullYear() === parseInt(year);
    return matchCat && matchMonth && matchYear;
  });

  const total = filtered.reduce((a, i) => a + i.amount, 0);

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = filtered.map((inv) => `
      <tr>
        <td>${inv.invoiceNumber}</td>
        <td>${inv.name}</td>
        <td>${CATEGORY_LABELS[inv.category]}</td>
        <td>${formatCurrency(inv.amount, inv.currency)}</td>
        <td>${formatShortDate(inv.date)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الفواتير</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'IBM Plex Sans Arabic', sans-serif; padding: 40px; color: #0f172a; }
          .header { border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
          .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { text-align: right; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; font-size: 12px; }
          td { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; }
          .total { text-align: left; margin-top: 20px; font-size: 18px; font-weight: 700; color: #6366f1; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">الإدارة المالية — خالد الشهراني</div>
          <div class="sub">تقرير الفواتير — ${filtered.length} فاتورة</div>
        </div>
        <table>
          <thead><tr><th>رقم الفاتورة</th><th>الاسم</th><th>التصنيف</th><th>المبلغ</th><th>التاريخ</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="total">الإجمالي: ${formatCurrency(total)}</div>
        <div class="footer">تم إنشاء هذا التقرير بواسطة منصة الإدارة المالية</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">التقارير</h1>
        <p className="text-sm text-text-muted mt-1">طباعة وتصدير الفواتير</p>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-card">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2.5 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
            <option value="">كل التصنيفات</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2.5 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={String(i+1)}>شهر {i+1}</option>
            ))}
          </select>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} min="2020" max="2030"
            className="px-3 py-2.5 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          <button onClick={handlePrintAll} disabled={filtered.length === 0}
            className="px-4 py-2.5 bg-gradient-to-l from-primary to-primary-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
            🖨️ طباعة التقرير
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-text-muted mb-1">عدد الفواتير</p>
          <p className="text-lg font-bold text-text-primary">{filtered.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-text-muted mb-1">الإجمالي</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Invoice List for Print Selection */}
      {filtered.length > 0 ? (
        <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="grid grid-cols-5 text-xs font-medium text-text-muted bg-surface-secondary p-3 border-b border-border">
            <span>الرقم</span><span>الاسم</span><span>التصنيف</span><span>المبلغ</span><span>التاريخ</span>
          </div>
          {filtered.map((inv) => (
            <div key={inv.id} className="grid grid-cols-5 text-sm p-3 border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
              <span className="text-text-muted text-xs">{inv.invoiceNumber}</span>
              <span className="font-medium truncate">{inv.name}</span>
              <span className="text-xs">{CATEGORY_LABELS[inv.category]}</span>
              <span className="font-semibold">{formatCurrency(inv.amount, inv.currency)}</span>
              <span className="text-text-muted text-xs">{formatShortDate(inv.date)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted text-sm">لا توجد فواتير في هذه الفترة</div>
      )}
    </div>
  );
}
