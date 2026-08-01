'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployee, deleteEmployee } from '@/features/employees/actions';
import { formatCurrency, CURRENCY_LABELS } from '@/lib/utils';

export function EmployeeForm() {
  const router = useRouter();
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
      router.push('/dashboard/employees');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      {error && <div className="bg-danger-bg text-danger rounded-xl p-3 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">الاسم <span className="text-danger">*</span></label>
        <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required
          className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" placeholder="اسم الموظف" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">البريد الإلكتروني</label>
          <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="اختياري" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">رقم الجوال</label>
          <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="اختياري" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">المسمى الوظيفي <span className="text-danger">*</span></label>
        <input type="text" value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} required
          className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="مثال: مصمم، مبرمج، مسوق" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-2">الراتب <span className="text-danger">*</span></label>
          <input type="number" step="0.01" value={form.salary} onChange={(e) => setForm({...form, salary: e.target.value})} required
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">العملة</label>
          <select value={form.currency} onChange={(e) => setForm({...form, currency: e.target.value})}
            className="w-full px-3 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
            {Object.entries(CURRENCY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 py-3 px-4 bg-gradient-to-l from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-60">
          {loading ? 'جاري الحفظ...' : 'إضافة الموظف'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 bg-surface-secondary border border-border text-text-secondary font-medium rounded-xl hover:bg-surface-hover transition-all">
          إلغاء
        </button>
      </div>
    </form>
  );
}

export function EmployeeCard({ employee, onDelete }: { employee: any; onDelete: (id: string) => void }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-salary-bg rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-salary">{employee.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{employee.name}</h3>
            <p className="text-xs text-text-muted">{employee.position}</p>
          </div>
        </div>
        <span className={`text-sm font-bold ${employee.isActive ? 'text-success' : 'text-text-muted'}`}>
          {employee.isActive ? 'نشط' : 'غير نشط'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div><span className="text-text-muted">الراتب: </span><span className="font-medium">{formatCurrency(employee.salary, employee.currency)}</span></div>
        {employee.email && <div><span className="text-text-muted">بريد: </span><span>{employee.email}</span></div>}
        {employee.phone && <div><span className="text-text-muted">جوال: </span><span>{employee.phone}</span></div>}
        <div><span className="text-text-muted">فواتير: </span><span>{employee._count?.invoices || 0}</span></div>
      </div>
      <button onClick={() => onDelete(employee.id)}
        className="w-full py-1.5 text-xs text-danger bg-danger-bg rounded-lg hover:bg-danger/10 transition-colors">
        حذف
      </button>
    </div>
  );
}
