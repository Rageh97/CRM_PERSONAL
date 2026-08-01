'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteInvoice } from '@/features/invoices/actions';
import { formatCurrency, formatShortDate, CATEGORY_LABELS, CURRENCY_LABELS } from '@/lib/utils';
import { hasPermission, type UserRole } from '@/lib/types';

interface InvoiceListProps {
  invoices: any[];
  userRole: string;
  userPermissions?: string[] | string;
}

const categoryBadge: Record<string, string> = {
  REVENUE: 'bg-revenue-bg text-revenue',
  EXPENSE: 'bg-expense-bg text-expense',
  RETURN: 'bg-return-bg text-return',
  SALARY: 'bg-salary-bg text-salary',
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
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'IBM Plex Sans Arabic', sans-serif; padding: 40px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
          .info { text-align: left; font-size: 12px; color: #64748b; }
          .inv-num { font-size: 14px; font-weight: 600; color: #0f172a; }
          .details { margin: 20px 0; }
          .details table { width: 100%; border-collapse: collapse; }
          .details th { text-align: right; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; font-size: 13px; }
          .details td { padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
          .total { text-align: left; margin-top: 20px; font-size: 20px; font-weight: 700; color: #6366f1; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">الإدارة المالية</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">خالد الشهراني</div>
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
          <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-text-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو رقم الفاتورة..."
            className="w-full ps-9 pe-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        >
          <option value="">كل التصنيفات</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm">لا توجد فواتير</p>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text-primary truncate">{inv.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryBadge[inv.category]}`}>
                      {CATEGORY_LABELS[inv.category]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>{inv.invoiceNumber}</span>
                    <span>•</span>
                    <span>{formatShortDate(inv.date)}</span>
                    {inv.createdBy && (
                      <>
                        <span>•</span>
                        <span>{inv.createdBy.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <p className={`text-base font-bold flex-shrink-0 ms-3 ${
                  inv.category === 'REVENUE' ? 'text-revenue' : 'text-expense'
                }`}>
                  {inv.category === 'REVENUE' ? '+' : '-'}{formatCurrency(inv.amount, inv.currency)}
                </p>
              </div>

              {inv.description && (
                <p className="text-xs text-text-muted mt-1 line-clamp-1">{inv.description}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border-light">
                <Link
                  href={`/dashboard/invoices/${inv.id}`}
                  className="px-3 py-1.5 text-xs font-medium text-primary bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  عرض
                </Link>
                {canEdit && (
                  <Link
                    href={`/dashboard/invoices/${inv.id}/edit`}
                    className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface-secondary rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    تعديل
                  </Link>
                )}
                <button
                  onClick={() => handlePrint(inv)}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface-secondary rounded-lg hover:bg-surface-hover transition-colors"
                >
                  طباعة
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(inv.id)}
                    disabled={deleting === inv.id}
                    className="px-3 py-1.5 text-xs font-medium text-danger bg-danger-bg rounded-lg hover:bg-danger/10 transition-colors ms-auto disabled:opacity-50"
                  >
                    {deleting === inv.id ? '...' : 'حذف'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
