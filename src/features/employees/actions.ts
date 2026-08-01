'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { employeeSchema, type EmployeeInput } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function createEmployee(data: EmployeeInput) {
  const session = await auth();
  if (!session?.user) throw new Error('غير مصرح');

  const validated = employeeSchema.parse(data);

  const employee = await prisma.employee.create({
    data: {
      name: validated.name,
      email: validated.email || null,
      phone: validated.phone || null,
      position: validated.position,
      salary: validated.salary,
      currency: validated.currency,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Employee',
      entityId: employee.id,
      details: JSON.stringify({ name: employee.name, position: employee.position }),
      userId: (session.user as any).id,
    },
  });

  revalidatePath('/dashboard/employees');
  return employee;
}

export async function updateEmployee(id: string, data: EmployeeInput) {
  const session = await auth();
  if (!session?.user) throw new Error('غير مصرح');

  const validated = employeeSchema.parse(data);

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      name: validated.name,
      email: validated.email || null,
      phone: validated.phone || null,
      position: validated.position,
      salary: validated.salary,
      currency: validated.currency,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Employee',
      entityId: employee.id,
      details: JSON.stringify({ name: employee.name }),
      userId: (session.user as any).id,
    },
  });

  revalidatePath('/dashboard/employees');
  return employee;
}

export async function deleteEmployee(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('غير مصرح');

  const employee = await prisma.employee.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      action: 'DELETE',
      entityType: 'Employee',
      entityId: id,
      details: JSON.stringify({ name: employee.name }),
      userId: (session.user as any).id,
    },
  });

  revalidatePath('/dashboard/employees');
}

export async function getEmployees() {
  return prisma.employee.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { invoices: true } } },
  });
}
