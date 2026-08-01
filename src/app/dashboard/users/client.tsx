'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_PERMISSIONS } from '@/lib/types';

export function UsersClient({ users }: { users: any[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    permissions: ['invoices:view', 'invoices:create'] as string[],
  });

  const togglePermission = (permId: string) => {
    setForm((prev) => {
      const exists = prev.permissions.includes(permId);
      const updated = exists
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: updated };
    });
  };

  const selectAllPermissions = () => {
    setForm((prev) => ({
      ...prev,
      permissions: ALL_PERMISSIONS.map((p) => p.id),
    }));
  };

  const clearAllPermissions = () => {
    setForm((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = editingId ? `/api/users?id=${editingId}` : '/api/users';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          permissions: JSON.stringify(form.permissions),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'فشل الحفظ');
      }

      setShowForm(false);
      setEditingId(null);
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        permissions: ['invoices:view', 'invoices:create'],
      });
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: any) => {
    let perms: string[] = [];
    try {
      perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions || [];
    } catch {
      perms = [];
    }
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      permissions: perms,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'فشل الحذف');
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const categories = ['الفواتير', 'الموظفين', 'التقارير والإعدادات'] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">إدارة المستخدمين والصلاحيات</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تخصيص وإدارة صلاحيات الموظفين بحرفية ودقة</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
            } else {
              setEditingId(null);
              setForm({
                name: '',
                email: '',
                password: '',
                role: 'EMPLOYEE',
                permissions: ['invoices:view', 'invoices:create'],
              });
              setShowForm(true);
            }
          }}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-md shadow-sm transition-colors self-start sm:self-auto"
        >
          {showForm ? 'إلغاء' : '+ إضافة موظف / مستخدم جديد'}
        </button>
      </div>

      {/* Form Drawer / Card */}
      {showForm && (
        <form onSubmit={handleCreateOrUpdate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-sm space-y-5 animate-slide-up">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5">
            {editingId ? 'تعديل بيانات وصلاحيات المستخدم' : 'إضافة مستخدم جديد وتحديد الصلاحيات'}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="اسم الموظف"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="email@company.com"
                dir="ltr"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition-colors text-left"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور {editingId && <span className="text-slate-400 font-normal">(اختياري)</span>} {!editingId && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingId}
                minLength={6}
                placeholder="••••••••"
                dir="ltr"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition-colors text-left"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">نوع الحساب</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition-colors"
              >
                <option value="EMPLOYEE">موظف (تخصيص صلاحيات محددة)</option>
                <option value="SUPER_ADMIN">سوبر أدمن (صلاحيات كاملة تلقائياً)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Checkboxes Matrix */}
          {form.role === 'EMPLOYEE' && (
            <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">مصفوفة الصلاحيات المتاحة للموظف:</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">اختر الصلاحيات المسموح بها للموظف فقط</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold rounded hover:bg-indigo-50 border border-indigo-200 dark:border-indigo-800 transition-colors"
                  >
                    تحديد الكل
                  </button>
                  <button
                    type="button"
                    onClick={clearAllPermissions}
                    className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded hover:bg-slate-200 transition-colors"
                  >
                    إلغاء الكل
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const catPerms = ALL_PERMISSIONS.filter((p) => p.category === cat);
                  return (
                    <div key={cat} className="bg-slate-50 dark:bg-slate-950 rounded-md p-3 border border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">{cat}</h4>
                      <div className="space-y-2">
                        {catPerms.map((perm) => {
                          const checked = form.permissions.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-2.5 p-2 rounded border transition-all cursor-pointer ${
                                checked
                                  ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-sm'
                                  : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePermission(perm.id)}
                                className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{perm.label}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{perm.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : editingId ? 'تحديث الصلاحيات' : 'إضافة الموظف والصلاحيات'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Structured High-Contrast Corporate Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/90 border-b-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold uppercase">
                <th className="p-3.5">المستخدم / البريد</th>
                <th className="p-3.5">نوع الحساب</th>
                <th className="p-3.5">الصلاحيات المخصصة</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((user) => {
                let userPerms: string[] = [];
                try {
                  userPerms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions || [];
                } catch {
                  userPerms = [];
                }
                const isSuper = user.role === 'SUPER_ADMIN';

                return (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Name & Email */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs ${
                          isSuper
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{user.name}</p>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono" dir="ltr">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="p-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                        isSuper
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      }`}>
                        {isSuper ? 'سوبر أدمن' : 'موظف مخصص'}
                      </span>
                    </td>

                    {/* Assigned Permissions Badges */}
                    <td className="p-3.5">
                      {isSuper ? (
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">كامل صلاحيات النظام (Super Admin)</span>
                      ) : userPerms.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">بدون صلاحيات</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {userPerms.map((pId) => {
                            const pObj = ALL_PERMISSIONS.find((p) => p.id === pId);
                            return (
                              <span
                                key={pId}
                                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[11px] font-semibold text-slate-800 dark:text-slate-200"
                              >
                                ✓ {pObj?.label || pId}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* High Contrast Corporate Action Buttons */}
                    <td className="p-3.5 text-center">
                      {!isSuper ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(user)}
                            className="px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors shadow-xs"
                          >
                            تعديل الصلاحيات
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/80 rounded-md border border-red-200 dark:border-red-800 transition-colors shadow-xs"
                          >
                            حذف
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
