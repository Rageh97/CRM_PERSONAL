import { prisma } from '@/lib/prisma';
import { ReportsClient } from './client';

export default async function ReportsPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { date: 'desc' },
    include: { createdBy: { select: { name: true } } },
  });

  const serialized = invoices.map((inv) => ({
    ...inv,
    date: inv.date.toISOString(),
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  }));

  return <ReportsClient invoices={serialized} />;
}
