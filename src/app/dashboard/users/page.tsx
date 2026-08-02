import { prisma } from '@/lib/prisma';
import { UsersClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      isActive: true,
      createdAt: true,
    },
  });

  const serialized = users.map((u: any) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return <UsersClient users={serialized} />;
}
