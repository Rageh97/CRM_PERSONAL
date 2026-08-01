import { prisma } from '@/lib/prisma';
import { SettingsClient } from './client';

export default async function SettingsPage() {
  let settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: { id: 'default' } });
  }
  const serialized = { ...settings, createdAt: settings.createdAt.toISOString(), updatedAt: settings.updatedAt.toISOString() };
  return <SettingsClient settings={serialized} />;
}
