'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployee } from '@/features/employees/actions';
import { formatCurrency, CURRENCY_LABELS } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';

export function EmployeeForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', position: '', salary: '', currency: 'SAR',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createEmployee({
        ...form,
        currency: (form.currency as 'SAR' | 'USD') || 'SAR',
        salary: parseFloat(form.salary) || 0,
        email: form.email || undefined,
        phone: form.phone || undefined,
      });

      showToast({ type: 'success', message: 'تم إضافة الموظف الجديد بنجاح' });
      router.push('/dashboard/employees');
      router.refresh();
    } catch (err: any) {
      const msg = err.message || 'حدث خطأ أثناء إضافة الموظف';
      setError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      {error && <div className="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-md p-3 text-xs font-bold">{error}</div>}

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
        <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required
          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 transition-all" placeholder="اسم الموظف" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني</label>
          <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 transition-all" placeholder="اختياري" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">رقم الجوال</label>
          <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 transition-all" placeholder="اختياري" dir="ltr" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">المسمى الوظيفي <span className="text-red-500">*</span></label>
        <input type="text" value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} required
          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 transition-all" placeholder="مثال: مصمم، مبرمج، مسوق" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">الراتب <span className="text-red-500">*</span></label>
          <input type="number" step="0.01" value={form.salary} onChange={(e) => setForm({...form, salary: e.target.value})} required
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 transition-all font-mono" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">العملة</label>
          <select value={form.currency} onChange={(e) => setForm({...form, currency: e.target.value})}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-white focus:outline-none transition-all">
            {Object.entries(CURRENCY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-all disabled:opacity-50">
          {loading ? 'جاري الحفظ...' : 'إضافة الموظف'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md hover:bg-slate-200 transition-all">
          إلغاء
        </button>
      </div>
    </form>
  );
}

export function EmployeeCard({ employee, onDelete }: { employee: any; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-xs">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded flex items-center justify-center font-bold text-xs">
            {employee.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">{employee.name}</h3>
            <p className="text-[11px] text-slate-500">{employee.position}</p>
          </div>
        </div>
        <span className={`text-xs font-bold ${employee.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
          {employee.isActive ? 'نشط' : 'غير نشط'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div><span className="text-slate-500">الراتب: </span><span className="font-bold">{formatCurrency(employee.salary, employee.currency)}</span></div>
        {employee.email && <div><span className="text-slate-500">بريد: </span><span>{employee.email}</span></div>}
        {employee.phone && <div><span className="text-slate-500">جوال: </span><span>{employee.phone}</span></div>}
        <div><span className="text-slate-500">فواتير: </span><span>{employee._count?.invoices || 0}</span></div>
      </div>
      <button onClick={() => onDelete(employee.id)}
        className="w-full py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors">
        حذف
      </button>
    </div>
  );
}
