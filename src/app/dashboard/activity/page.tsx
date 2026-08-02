import { prisma } from '@/lib/prisma';
import { ActivityClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ActivityPage() {
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, role: true } } },
  });

  const serialized = activities.map((a: any) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return <ActivityClient activities={serialized} />;
}
