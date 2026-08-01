import { getInvoices } from '@/features/invoices/actions';
import { InvoiceList } from '@/features/invoices/InvoiceList';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import type { UserRole } from '@/lib/types';

export default async function InvoicesPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role as string || 'EMPLOYEE';
  const userPermissions = (session?.user as any)?.permissions || [];
  const invoices = await getInvoices();

  const serialized = invoices.map((inv) => ({
    ...inv,
    date: inv.date.toISOString(),
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">الفواتير</h1>
          <p className="text-sm text-text-muted mt-1">{invoices.length} فاتورة</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="px-4 py-2.5 bg-gradient-to-l from-primary to-primary-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          + فاتورة جديدة
        </Link>
      </div>
      <InvoiceList invoices={serialized} userRole={userRole} userPermissions={userPermissions} />
    </div>
  );
}
