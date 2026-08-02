'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/providers/ToastProvider';

export function SettingsClient({ settings }: { settings: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
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

    if (form.adminPassword && form.adminPassword !== form.confirmPassword) {
      const msg = 'كلمة المرور وتأكيد كلمة المرور غير متطابقين';
      setError(msg);
      showToast({ type: 'error', message: msg });
      return;
    }

    if (form.adminPassword && form.adminPassword.length < 6) {
      const msg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      setError(msg);
      showToast({ type: 'error', message: msg });
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

      showToast({ type: 'success', message: 'تم حفظ وتحديث بيانات حساب السوبر أدمن بنجاح' });
      setForm((prev) => ({ ...prev, adminPassword: '', confirmPassword: '' }));
      router.refresh();
    } catch (err: any) {
      const msg = err.message || 'حدث خطأ أثناء الحفظ';
      setError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const executeResetDemoData = async () => {
    setError('');
    setResetLoading(true);

    try {
      const res = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل في حذف البيانات التجريبية');
      }

      const data = await res.json();
      showToast({
        type: 'success',
        message: data.message || 'تم حذف كافة البيانات التجريبية بنجاح، والإبقاء على حساب السوبر أدمن فقط',
      });
      setShowResetModal(false);
      router.refresh();
    } catch (err: any) {
      const msg = err.message || 'حدث خطأ أثناء مسح البيانات التجريبية';
      setError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        title="تأكيد حاسم: حذف البيانات التجريبية بالكامل"
        message="هل أنت متأكد 100% من حذف كافة الفواتير والموظفين والمستخدمين الإضافيين؟ سيتم البدء بنظام نظيف وفارغ كلياً مع الحفاظ التام على حساب السوبر أدمن والبريد الإلكتروني وكلمة المرور الخاصة بك."
        confirmText="نعم، حذف البيانات التجريبية والبدء من جديد"
        cancelText="إلغاء"
        type="danger"
        loading={resetLoading}
        onConfirm={executeResetDemoData}
        onCancel={() => setShowResetModal(false)}
      />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">إعدادات الحساب والنظام</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تحديث البريد وكلمة المرور وحذف البيانات التجريبية</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-md p-3.5 text-xs text-center font-bold animate-fade-in">
            {error}
          </div>
        )}

        {/* Section 1: Super Admin Credentials */}
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              بيانات حساب السوبر أدمن (Super Admin)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">تحديث البريد الإلكتروني وكلمة المرور لحسابك الإداري</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                البريد الإلكتروني الحساب الإداري
              </label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                required
                dir="ltr"
                placeholder="admin@shahrani.com"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 transition-all text-left font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                كلمة المرور الجديدة <span className="text-slate-400 font-normal">(اتركها فارغة إذا لم تُرِد التغيير)</span>
              </label>
              <input
                type="password"
                value={form.adminPassword}
                onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                minLength={6}
                dir="ltr"
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 transition-all text-left font-mono"
              />
            </div>

            {form.adminPassword && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 transition-all text-left font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Admin Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors disabled:opacity-50"
        >
          {loading ? 'جاري حفظ التغييرات...' : 'حفظ تغييرات الحساب الإداري'}
        </button>
      </form>

      {/* Danger Zone: Delete Demo Data */}
      <div className="bg-red-50/50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900 rounded-md p-5 sm:p-6 space-y-4 mt-8">
        <div className="border-b border-red-200 dark:border-red-900/60 pb-3">
          <h2 className="text-sm font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
            منطقة الإجراءات الحساسة (تفريغ البيانات التجريبية)
          </h2>
          <p className="text-xs text-red-700 dark:text-red-400 mt-1 leading-relaxed">
            حذف كافة البيانات التجريبية بالكامل (الفواتير، الموظفين، والمستخدمين الإضافيين) والبدء بنظام فارغ ونظيف تماماً، مع الإبقاء التام والكامل على حساب السوبر أدمن والبريد وكلمة المرور الخاصة بك.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="text-xs text-red-800 dark:text-red-300 font-semibold">
            تنظيف البيانات وتهيئة النظام لاستقبال بياناتك الحقيقية
          </div>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            disabled={resetLoading}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            حذف البيانات التجريبية والبدء من الجديد
          </button>
        </div>
      </div>
    </div>
  );
}
