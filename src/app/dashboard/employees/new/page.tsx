import { EmployeeForm } from '@/features/employees/components';

export default function NewEmployeePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">إضافة موظف</h1>
        <p className="text-sm text-text-muted mt-1">أدخل بيانات الموظف الجديد</p>
      </div>
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-card">
        <EmployeeForm />
      </div>
    </div>
  );
}
