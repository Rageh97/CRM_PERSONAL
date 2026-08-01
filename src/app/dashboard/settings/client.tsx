'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRENCY_LABELS } from '@/lib/utils';

export function SettingsClient({ settings }: { settings: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    companyName: settings?.companyName || 'شركتي',
    primaryColor: settings?.primaryColor || '#6366f1',
    secondaryColor: settings?.secondaryColor || '#8b5cf6',
    contactEmail: settings?.contactEmail || '',
    contactPhone: settings?.contactPhone || '',
    contactAddress: settings?.contactAddress || '',
    defaultCurrency: settings?.defaultCurrency || 'SAR',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">الإعدادات</h1>
        <p className="text-sm text-text-muted mt-1">إعدادات النظام والشركة</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-card space-y-5">
        {saved && (
          <div className="bg-success-bg border border-success/20 text-success rounded-xl p-3 text-sm text-center animate-fade-in">
            ✅ تم حفظ الإعدادات بنجاح
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">اسم الشركة</label>
          <input type="text" value={form.companyName} onChange={(e) => setForm({...form, companyName: e.target.value})}
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">اللون الأساسي</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primaryColor} onChange={(e) => setForm({...form, primaryColor: e.target.value})}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
              <input type="text" value={form.primaryColor} onChange={(e) => setForm({...form, primaryColor: e.target.value})}
                className="flex-1 px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">اللون الثانوي</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.secondaryColor} onChange={(e) => setForm({...form, secondaryColor: e.target.value})}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
              <input type="text" value={form.secondaryColor} onChange={(e) => setForm({...form, secondaryColor: e.target.value})}
                className="flex-1 px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">بريد التواصل</label>
            <input type="email" value={form.contactEmail} onChange={(e) => setForm({...form, contactEmail: e.target.value})} placeholder="info@company.com"
              className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">رقم التواصل</label>
            <input type="text" value={form.contactPhone} onChange={(e) => setForm({...form, contactPhone: e.target.value})} placeholder="+966..."
              className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">العنوان</label>
          <input type="text" value={form.contactAddress} onChange={(e) => setForm({...form, contactAddress: e.target.value})} placeholder="المملكة العربية السعودية"
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">العملة الافتراضية</label>
          <select value={form.defaultCurrency} onChange={(e) => setForm({...form, defaultCurrency: e.target.value})}
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
            {Object.entries(CURRENCY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-l from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-60">
          {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}
