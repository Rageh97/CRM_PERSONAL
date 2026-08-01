import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role, permissions } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role || 'EMPLOYEE',
      permissions: typeof permissions === 'string' ? permissions : JSON.stringify(permissions || []),
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      details: JSON.stringify({ name, email, role }),
      userId: (session.user as any).id,
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const body = await req.json();
  const { name, email, password, role, permissions } = body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });

  const updateData: any = {
    name,
    email,
    role: role || user.role,
    permissions: typeof permissions === 'string' ? permissions : JSON.stringify(permissions || []),
  };

  if (password && password.trim().length >= 6) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  await prisma.activityLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'User',
      entityId: updated.id,
      details: JSON.stringify({ name: updated.name, role: updated.role }),
      userId: (session.user as any).id,
    },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    permissions: updated.permissions,
  });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'المعرّف مطلوب' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  if (user.role === 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'لا يمكن حذف حساب السوبر أدمن' }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      action: 'DELETE',
      entityType: 'User',
      entityId: id,
      details: JSON.stringify({ name: user.name, email: user.email }),
      userId: (session.user as any).id,
    },
  });

  return NextResponse.json({ success: true });
}
