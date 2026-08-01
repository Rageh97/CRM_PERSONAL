'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice, updateInvoice } from '@/features/invoices/actions';
import { CATEGORY_LABELS, CURRENCY_LABELS } from '@/lib/utils';

interface InvoiceFormProps {
  invoice?: any;
  employees?: { id: string; name: string; position: string }[];
  mode?: 'create' | 'edit';
}

export function InvoiceForm({ invoice, employees = [], mode = 'create' }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: invoice?.name || '',
    amount: invoice?.amount || '',
    description: invoice?.description || '',
    category: invoice?.category || 'EXPENSE',
    currency: invoice?.currency || 'SAR',
    date: invoice?.date ? new Date(invoice.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    employeeId: invoice?.employeeId || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...form,
        amount: parseFloat(String(form.amount)) || 0,
        employeeId: form.employeeId || undefined,
      };

      if (mode === 'edit' && invoice) {
        await updateInvoice(invoice.id, data);
      } else {
        await createInvoice(data);
      }

      router.push('/dashboard/invoices');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الفاتورة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {error && (
        <div className="bg-danger-bg border border-danger/20 text-danger rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          اسم الفاتورة <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="مثال: اشتراك سيرفر"
          required
          className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Amount + Currency */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            المبلغ <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            required
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">العملة</label>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="w-full px-3 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            {Object.entries(CURRENCY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          التصنيف <span className="text-danger">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setForm({ ...form, category: key, employeeId: key !== 'SALARY' ? '' : form.employeeId })}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                form.category === key
                  ? key === 'REVENUE' ? 'bg-revenue/10 border-revenue text-revenue' :
                    key === 'EXPENSE' ? 'bg-expense/10 border-expense text-expense' :
                    key === 'RETURN' ? 'bg-return/10 border-return text-return' :
                    'bg-salary/10 border-salary text-salary'
                  : 'bg-surface-secondary border-border text-text-secondary hover:border-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Employee (for Salary) */}
      {form.category === 'SALARY' && employees.length > 0 && (
        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-text-secondary mb-2">الموظف</label>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">اختر الموظف</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name} — {emp.position}</option>
            ))}
          </select>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">التاريخ</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          الوصف / الملاحظة <span className="text-text-muted text-xs">(اختياري)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="أضف وصفاً أو ملاحظة..."
          rows={3}
          className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-gradient-to-l from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              جاري الحفظ...
            </span>
          ) : (
            mode === 'edit' ? 'تحديث الفاتورة' : 'إنشاء الفاتورة'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-surface-secondary border border-border text-text-secondary font-medium rounded-xl hover:bg-surface-hover transition-all"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
