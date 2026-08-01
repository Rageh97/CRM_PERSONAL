'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteInvoice } from '@/features/invoices/actions';
import { formatCurrency, formatShortDate, CATEGORY_LABELS, CURRENCY_LABELS } from '@/lib/utils';
import { hasPermission } from '@/lib/types';

interface InvoiceListProps {
  invoices: any[];
  userRole: string;
  userPermissions?: string[] | string;
}

const categoryBadge: Record<string, string> = {
  REVENUE: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  EXPENSE: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
  RETURN: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  SALARY: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
};

export function InvoiceList({ invoices, userRole, userPermissions = [] }: InvoiceListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const canEdit = hasPermission(userRole, userPermissions, 'invoices:edit');
  const canDelete = hasPermission(userRole, userPermissions, 'invoices:delete');

  const filtered = invoices.filter((inv) => {
    const matchSearch = !search || 
      inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || inv.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    setDeleting(id);
    try {
      await deleteInvoice(id);
      router.refresh();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(null);
    }
  };

  const handlePrint = (inv: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ${inv.invoiceNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Cairo', sans-serif; padding: 40px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 22px; font-weight: 800; color: #0f172a; }
          .info { text-align: left; font-size: 12px; color: #475569; }
          .inv-num { font-size: 14px; font-weight: 700; color: #0f172a; }
          .details { margin: 20px 0; }
          .details table { width: 100%; border-collapse: collapse; }
          .details th { text-align: right; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; }
          .details td { padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
          .total { text-align: left; margin-top: 20px; font-size: 18px; font-weight: 800; color: #0f172a; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">منصة الإدارة المالية</div>
            <div style="font-size:12px;color:#475569;margin-top:4px;">خالد الشهراني</div>
          </div>
          <div class="info">
            <div class="inv-num">${inv.invoiceNumber}</div>
            <div>التاريخ: ${formatShortDate(inv.date)}</div>
          </div>
        </div>
        <div class="details">
          <table>
            <tr><th>اسم الفاتورة</th><td>${inv.name}</td></tr>
            <tr><th>التصنيف</th><td>${CATEGORY_LABELS[inv.category] || inv.category}</td></tr>
            <tr><th>المبلغ</th><td>${formatCurrency(inv.amount, inv.currency)}</td></tr>
            <tr><th>العملة</th><td>${CURRENCY_LABELS[inv.currency] || inv.currency}</td></tr>
            ${inv.description ? `<tr><th>الوصف</th><td>${inv.description}</td></tr>` : ''}
            <tr><th>أنشأها</th><td>${inv.createdBy?.name || '-'}</td></tr>
          </table>
        </div>
        <div class="total">الإجمالي: ${formatCurrency(inv.amount, inv.currency)}</div>
        <div class="footer">تم إنشاء هذه الفاتورة بواسطة منصة الإدارة المالية — خالد الشهراني</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو رقم الفاتورة..."
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none transition-colors"
        >
          <option value="">كل التصنيفات</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Corporate Structured Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 text-xs font-medium">
          لا توجد فواتير مطابقة
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 border-b-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold uppercase">
                  <th className="p-3.5">رقم الفاتورة</th>
                  <th className="p-3.5">اسم الفاتورة</th>
                  <th className="p-3.5">التصنيف</th>
                  <th className="p-3.5">المبلغ</th>
                  <th className="p-3.5">التاريخ</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Invoice Number */}
                    <td className="p-3.5 font-bold font-mono text-slate-900 dark:text-white" dir="ltr text-right">
                      {inv.invoiceNumber}
                    </td>

                    {/* Name & Creator */}
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{inv.name}</p>
                      {inv.createdBy && <p className="text-[11px] text-slate-500 font-medium">{inv.createdBy.name}</p>}
                    </td>

                    {/* Category Badge */}
                    <td className="p-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${categoryBadge[inv.category]}`}>
                        {CATEGORY_LABELS[inv.category]}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-3.5">
                      <p className={`font-extrabold text-sm ${
                        inv.category === 'REVENUE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {inv.category === 'REVENUE' ? '+' : '-'}{formatCurrency(inv.amount, inv.currency)}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                      {formatShortDate(inv.date)}
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/dashboard/invoices/${inv.id}`}
                          className="px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-700 transition-colors"
                        >
                          عرض
                        </Link>
                        {canEdit && (
                          <Link
                            href={`/dashboard/invoices/${inv.id}/edit`}
                            className="px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors"
                          >
                            تعديل
                          </Link>
                        )}
                        <button
                          onClick={() => handlePrint(inv)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-700 transition-colors"
                        >
                          طباعة
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(inv.id)}
                            disabled={deleting === inv.id}
                            className="px-2.5 py-1 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/80 rounded-md border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
                          >
                            {deleting === inv.id ? '...' : 'حذف'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
