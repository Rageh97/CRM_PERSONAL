'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteEmployee } from '@/features/employees/actions';
import { EmployeeCard } from '@/features/employees/components';
import Link from 'next/link';

export function EmployeeListClient({ employees }: { employees: any[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await deleteEmployee(id);
      router.refresh();
    } catch {
      alert('حدث خطأ');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">الموظفين</h1>
          <p className="text-sm text-text-muted mt-1">{employees.length} موظف</p>
        </div>
        <Link href="/dashboard/employees/new"
          className="px-4 py-2.5 bg-gradient-to-l from-primary to-primary-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all">
          + موظف جديد
        </Link>
      </div>
      {employees.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">لا يوجد موظفين بعد</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
          {employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
