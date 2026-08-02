'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteEmployee } from '@/features/employees/actions';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/providers/ToastProvider';

export function EmployeeListClient({ employees }: { employees: any[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const executeDelete = async () => {
    if (!deletingId) return;
    setLoadingDelete(true);
    try {
      await deleteEmployee(deletingId);
      showToast({ type: 'success', message: 'تم حذف الموظف بنجاح' });
      setDeletingId(null);
      router.refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'حدث خطأ أثناء حذف الموظف' });
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="تأكيد حذف الموظف"
        message="هل أنت متأكد من رغبتك في حذف هذا الموظف من النظام؟"
        confirmText="نعم، حذف الموظف"
        cancelText="إلغاء"
        type="danger"
        loading={loadingDelete}
        onConfirm={executeDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">إدارة الموظفين والرواتب</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">سجل الموظفين والمسمى الوظيفي وفواتير الرواتب</p>
        </div>
        <Link
          href="/dashboard/employees/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          + إضافة موظف جديد
        </Link>
      </div>

      {/* Clean Corporate Table */}
      {employees.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-500 text-xs font-medium">
          لا يوجد موظفين مسجلين بعد
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold uppercase">
                  <th className="p-3">اسم الموظف</th>
                  <th className="p-3">المسمى الوظيفي</th>
                  <th className="p-3">الراتب الأساسي</th>
                  <th className="p-3">رقم التواصل</th>
                  <th className="p-3 text-center">الفواتير المرتبطة</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{emp.name}</p>
                          {emp.email && <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-mono" dir="ltr">{emp.email}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {emp.position}
                    </td>

                    <td className="p-3 font-extrabold text-purple-700 dark:text-purple-300">
                      {formatCurrency(emp.salary, emp.currency)}
                    </td>

                    <td className="p-3 text-slate-600 dark:text-slate-400 font-mono font-medium" dir="ltr">
                      {emp.phone || '—'}
                    </td>

                    <td className="p-3 text-center font-semibold">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {emp._count?.invoices || 0} فاتورة
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                        emp.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {emp.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setDeletingId(emp.id)}
                        className="px-2.5 py-1 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 hover:bg-red-100 rounded border border-red-200 dark:border-red-800 transition-colors"
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
