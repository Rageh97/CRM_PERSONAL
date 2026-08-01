import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const body = await req.json();

  const settings = await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {
      companyName: body.companyName,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
      contactAddress: body.contactAddress || null,
      defaultCurrency: body.defaultCurrency,
    },
    create: {
      id: 'default',
      companyName: body.companyName,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
      contactAddress: body.contactAddress || null,
      defaultCurrency: body.defaultCurrency,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Settings',
      details: JSON.stringify({ companyName: body.companyName }),
      userId: (session.user as any).id,
    },
  });

  return NextResponse.json(settings);
}
