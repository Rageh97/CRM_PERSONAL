'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CURRENCY_LABELS } from '@/lib/utils';

export function SettingsClient({ settings }: { settings: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const currentUserEmail = session?.user?.email || '';

  const [form, setForm] = useState({
    companyName: settings?.companyName || 'شركتي',
    primaryColor: settings?.primaryColor || '#2563eb',
    secondaryColor: settings?.secondaryColor || '#7c3aed',
    contactEmail: settings?.contactEmail || '',
    contactPhone: settings?.contactPhone || '',
    contactAddress: settings?.contactAddress || '',
    defaultCurrency: settings?.defaultCurrency || 'SAR',
    adminEmail: currentUserEmail,
    adminPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (form.adminPassword && form.adminPassword !== form.confirmPassword) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقين');
      return;
    }

    if (form.adminPassword && form.adminPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل في حفظ الإعدادات');
      }

      setSaved(true);
      setForm((prev) => ({ ...prev, adminPassword: '', confirmPassword: '' }));
      router.refresh();
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">إعدادات النظام والشركة</h1>
        <p className="text-sm text-text-muted mt-1">تخصيص معلومات المنصة والحساب الإداري الرئيسي</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {saved && (
          <div className="bg-success-bg border border-success/20 text-success rounded-lg p-3.5 text-sm text-center font-medium animate-fade-in">
            ✅ تم حفظ الإعدادات وتحديث بيانات الحساب بنجاح
          </div>
        )}

        {error && (
          <div className="bg-danger-bg border border-danger/20 text-danger rounded-lg p-3.5 text-sm text-center font-medium animate-fade-in">
            {error}
          </div>
        )}

        {/* Section 1: Super Admin Credentials */}
        <div className="bg-surface rounded-lg border border-border p-5 sm:p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              🔐 بيانات حساب السوبر أدمن (Super Admin)
            </h2>
            <p className="text-xs text-text-muted mt-0.5">تحديث البريد الإلكتروني وكلمة المرور لحسابك الإداري</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                البريد الإلكتروني الحساب الإداري
              </label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                required
                dir="ltr"
                placeholder="admin@shahrani.com"
                className="w-full px-3.5 py-2.5 bg-surface-secondary border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                كلمة المرور الجديدة <span className="text-text-muted font-normal">(اتركها فارغة إذا لم تُرِد التغيير)</span>
              </label>
              <input
                type="password"
                value={form.adminPassword}
                onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                minLength={6}
                dir="ltr"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-surface-secondary border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left"
              />
            </div>

            {form.adminPassword && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required={!!form.adminPassword}
                  minLength={6}
                  dir="ltr"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-surface-secondary border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Company & System Identity Settings */}
        <div className="bg-surface rounded-lg border border-border p-5 sm:p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              🏢 بيانات الهوية والنظام
            </h2>
            <p className="text-xs text-text-muted mt-0.5">اسم المنصة في الطباعة، الألوان المعتمدة والعملة الافتراضية</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">اسم الشركة / المنصة</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 bg-surface-secondary border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">اللون الأساسي</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-9 h-9 rounded border border-border cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-md text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">اللون الثانوي</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-9 h-9 rounded border border-border cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-md text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">بريد التواصل للشركة</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="info@shahrani.com"
                className="w-full px-3.5 py-2.5 bg-surface-secondary border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">رقم التواصل</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="+966501234567"
                className="w-full px-3.5 py-2.5 bg-surface-secondary border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">العنوان المسجل للشركة</label>
            <input
              type="text"
              value={form.contactAddress}
              onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
              placeholder="المملكة العربية السعودية"
              className="w-full px-3.5 py-2.5 bg-surface-secondary border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">العملة الافتراضية للنظام</label>
            <select
              value={form.defaultCurrency}
              onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-secondary border border-border rounded-md text-text-primary text-sm focus:outline-none focus:border-primary transition-all"
            >
              {Object.entries(CURRENCY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold rounded-md shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'جاري حفظ التغييرات...' : 'حفظ الإعدادات والحساب'}
        </button>
      </form>
    </div>
  );
}
