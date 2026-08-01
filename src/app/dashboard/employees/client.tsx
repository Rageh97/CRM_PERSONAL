'use client';

import { useRouter } from 'next/navigation';
import { deleteEmployee } from '@/features/employees/actions';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export function EmployeeListClient({ employees }: { employees: any[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await deleteEmployee(id);
      router.refresh();
    } catch {
      alert('حدث خطأ أثناء حذف الموظف');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">إدارة الموظفين والرواتب</h1>
          <p className="text-xs text-text-muted mt-1">سجل الموظفين والمسمى الوظيفي وفواتير الرواتب</p>
        </div>
        <Link
          href="/dashboard/employees/new"
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-md shadow-sm transition-colors self-start sm:self-auto"
        >
          + إضافة موظف جديد
        </Link>
      </div>

      {/* Employees Corporate Data Table */}
      {employees.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border rounded-lg text-text-muted text-xs">
          لا يوجد موظفين مسجلين بعد
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-border text-slate-700 dark:text-slate-300 font-bold">
                  <th className="p-3.5">اسم الموظف</th>
                  <th className="p-3.5">المسمى الوظيفي</th>
                  <th className="p-3.5">الراتب الأساسي</th>
                  <th className="p-3.5">رقم التواصل</th>
                  <th className="p-3.5 text-center">الفواتير المرتبطة</th>
                  <th className="p-3.5 text-center">الحالة</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Employee Name & Email */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                          {emp.email && <p className="text-[11px] text-slate-500 font-mono" dir="ltr">{emp.email}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {emp.position}
                    </td>

                    {/* Salary */}
                    <td className="p-3.5 font-bold text-purple-700 dark:text-purple-400">
                      {formatCurrency(emp.salary, emp.currency)}
                    </td>

                    {/* Phone */}
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono" dir="ltr">
                      {emp.phone || '—'}
                    </td>

                    {/* Invoices Count */}
                    <td className="p-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px]">
                        {emp._count?.invoices || 0} فاتورة
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        emp.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {emp.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded border border-red-200 dark:border-red-900 transition-colors"
                      >
                        حذف
                      </button>
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
