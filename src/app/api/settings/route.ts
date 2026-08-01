import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;

  if (!session?.user || userRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const body = await req.json();

  // Update System Settings
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

  // Update Super Admin Account (Email / Password) if provided
  if (userId) {
    const userUpdateData: any = {};
    
    if (body.adminEmail && body.adminEmail.trim() !== '') {
      // Check if email taken by another user
      const existing = await prisma.user.findFirst({
        where: { email: body.adminEmail, id: { not: userId } },
      });
      if (existing) {
        return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل بحساب آخر' }, { status: 400 });
      }
      userUpdateData.email = body.adminEmail.trim();
    }

    if (body.adminPassword && body.adminPassword.trim().length >= 6) {
      userUpdateData.password = await bcrypt.hash(body.adminPassword.trim(), 12);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }
  }

  await prisma.activityLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Settings',
      details: JSON.stringify({ companyName: body.companyName, updatedAdminAccount: !!body.adminPassword || !!body.adminEmail }),
      userId: userId || 'system',
    },
  });

  return NextResponse.json(settings);
}
