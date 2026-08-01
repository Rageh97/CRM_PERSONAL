import { getEmployees } from '@/features/employees/actions';
import { EmployeeListClient } from './client';

export default async function EmployeesPage() {
  const employees = await getEmployees();
  const serialized = employees.map((e) => ({
    ...e,
    hireDate: e.hireDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return <EmployeeListClient employees={serialized} />;
}
