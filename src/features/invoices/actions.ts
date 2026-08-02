'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { invoiceSchema, type InvoiceInput } from '@/lib/validations';
import { generateInvoiceNumber } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function createInvoice(data: InvoiceInput & { attachment?: string }) {
  const session = await auth();
  if (!session?.user) throw new Error('غير مصرح');

  const validated = invoiceSchema.parse(data);

  // Generate unique invoice number safely
  const count = await prisma.invoice.count();
  let counter = count + 1;
  let invoiceNumber = generateInvoiceNumber(counter);
  let existing = await prisma.invoice.findUnique({ where: { invoiceNumber } });
  while (existing) {
    counter++;
    invoiceNumber = generateInvoiceNumber(counter);
    existing = await prisma.invoice.findUnique({ where: { invoiceNumber } });
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      name: validated.name,
      description: validated.description || null,
      amount: validated.amount,
      currency: validated.currency,
      category: validated.category,
      date: new Date(validated.date),
      employeeId: validated.employeeId || null,
      attachment: data.attachment || null,
      createdById: (session.user as any).id,
    },
  });

  // Activity log
  await prisma.activityLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Invoice',
      entityId: invoice.id,
      details: JSON.stringify({ name: invoice.name, amount: invoice.amount, category: invoice.category }),
      userId: (session.user as any).id,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/invoices');
  return invoice;
}

export async function updateInvoice(id: string, data: InvoiceInput) {
  const session = await auth();
  if (!session?.user) throw new Error('غير مصرح');

  const validated = invoiceSchema.parse(data);

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      name: validated.name,
      description: validated.description || null,
      amount: validated.amount,
      currency: validated.currency,
      category: validated.category,
      date: new Date(validated.date),
      employeeId: validated.employeeId || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Invoice',
      entityId: invoice.id,
      details: JSON.stringify({ name: invoice.name, amount: invoice.amount }),
      userId: (session.user as any).id,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/invoices');
  revalidatePath(`/dashboard/invoices/${id}`);
  return invoice;
}

export async function deleteInvoice(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('غير مصرح');

  const invoice = await prisma.invoice.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      action: 'DELETE',
      entityType: 'Invoice',
      entityId: id,
      details: JSON.stringify({ name: invoice.name, invoiceNumber: invoice.invoiceNumber }),
      userId: (session.user as any).id,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/invoices');
}

export async function getInvoices(filters?: {
  category?: string;
  currency?: string;
  search?: string;
  month?: string;
  year?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const where: any = {};

  if (filters?.category) where.category = filters.category;
  if (filters?.currency) where.currency = filters.currency;
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { invoiceNumber: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }

  if (filters?.month || filters?.year) {
    const year = parseInt(filters?.year || String(new Date().getFullYear()));
    const month = filters?.month ? parseInt(filters.month) - 1 : undefined;

    if (month !== undefined) {
      where.date = {
        gte: new Date(year, month, 1),
        lt: new Date(year, month + 1, 1),
      };
    } else {
      where.date = {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      };
    }
  }

  const orderBy: any = {};
  if (filters?.sortBy) {
    orderBy[filters.sortBy] = filters.sortOrder || 'desc';
  } else {
    orderBy.date = 'desc';
  }

  return prisma.invoice.findMany({
    where,
    orderBy,
    include: {
      createdBy: { select: { name: true } },
      employee: { select: { name: true } },
    },
  });
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } },
      employee: { select: { name: true, position: true } },
    },
  });
}
