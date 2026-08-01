'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_PERMISSIONS, type PermissionItem } from '@/lib/types';

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
      password: '', // leave empty unless updating password
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

  // Group permissions by category
  const categories = ['الفواتير', 'الموظفين', 'التقارير والإعدادات'] as const;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">إدارة المستخدمين والصلاحيات</h1>
          <p className="text-sm text-text-muted mt-1">تحديد ودعم صلاحيات الموظفين بدقة</p>
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
          className="px-4 py-2.5 bg-gradient-to-l from-primary to-primary-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          {showForm ? 'إلغاء' : '+ موظف / مستخدم جديد'}
        </button>
      </div>

      {/* Form with Checkboxes */}
      {showForm && (
        <form onSubmit={handleCreateOrUpdate} className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-card space-y-6 animate-slide-up">
          <h2 className="text-base font-bold text-text-primary border-b border-border pb-3">
            {editingId ? 'تعديل صلاحيات المستخدم' : 'إضافة موظف / مستخدم جديد'}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">الاسم الكامل <span className="text-danger">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="اسم الموظف"
                className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">البريد الإلكتروني <span className="text-danger">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="email@company.com"
                className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                كلمة المرور {editingId && <span className="text-text-muted">(اتركها فارغة إذا لم تُرِد التغيير)</span>} {!editingId && <span className="text-danger">*</span>}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingId}
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">نوع الحساب</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <option value="EMPLOYEE">موظف (تحديد صلاحيات مخصصة)</option>
                <option value="SUPER_ADMIN">سوبر أدمن (صلاحيات كاملة تلقائياً)</option>
              </select>
            </div>
          </div>

          {/* Granular Permission Checkboxes */}
          {form.role === 'EMPLOYEE' && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">تحديد الصلاحيات المسموحة للموظف</h3>
                  <p className="text-xs text-text-muted">قم بتحديد المزايا والوظائف التي يُسمح للموظف بالوصول إليها</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
                  >
                    تحديد الكل
                  </button>
                  <button
                    type="button"
                    onClick={clearAllPermissions}
                    className="px-3 py-1 text-xs bg-surface-secondary text-text-muted rounded-lg font-medium hover:bg-surface-hover transition-colors"
                  >
                    إلغاء الكل
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {categories.map((cat) => {
                  const catPerms = ALL_PERMISSIONS.filter((p) => p.category === cat);
                  return (
                    <div key={cat} className="bg-surface-secondary/60 rounded-xl p-3 border border-border-light">
                      <h4 className="text-xs font-bold text-primary mb-2.5">{cat}</h4>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {catPerms.map((perm) => {
                          const checked = form.permissions.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                checked
                                  ? 'bg-surface border-primary/40 shadow-sm'
                                  : 'bg-surface/50 border-border/50 hover:bg-surface'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePermission(perm.id)}
                                className="mt-1 w-4 h-4 rounded text-primary border-border focus:ring-primary/30"
                              />
                              <div>
                                <p className="text-xs font-semibold text-text-primary">{perm.label}</p>
                                <p className="text-[11px] text-text-muted mt-0.5">{perm.desc}</p>
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

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-l from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة وتخصيص الصلاحيات'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-6 py-3 bg-surface-secondary border border-border text-text-secondary font-medium rounded-xl hover:bg-surface-hover transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* User Cards */}
      <div className="space-y-3 stagger-children">
        {users.map((user) => {
          let userPerms: string[] = [];
          try {
            userPerms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions || [];
          } catch {
            userPerms = [];
          }

          const isSuper = user.role === 'SUPER_ADMIN';

          return (
            <div
              key={user.id}
              className="bg-surface border border-border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    isSuper ? 'bg-primary-50 text-primary' : 'bg-salary-bg text-salary'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-text-primary">{user.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        isSuper ? 'bg-primary-50 text-primary' : 'bg-success-bg text-success'
                      }`}>
                        {isSuper ? 'سوبر أدمن' : 'موظف'}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                  </div>
                </div>

                {!isSuper && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => startEdit(user)}
                      className="px-3 py-1.5 text-xs font-medium text-primary bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      تعديل الصلاحيات
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1.5 text-xs font-medium text-danger bg-danger-bg rounded-lg hover:bg-danger/10 transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                )}
              </div>

              {/* Permissions list badges for employee */}
              {!isSuper && (
                <div className="pt-3 border-t border-border-light">
                  <p className="text-[11px] font-medium text-text-muted mb-2">الصلاحيات الممنوحة:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {userPerms.length === 0 ? (
                      <span className="text-xs text-text-muted italic">لا توجد صلاحيات مخصصة</span>
                    ) : (
                      userPerms.map((permId) => {
                        const perm = ALL_PERMISSIONS.find((p) => p.id === permId);
                        return (
                          <span
                            key={permId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-secondary text-text-secondary border border-border-light rounded-lg text-xs font-medium"
                          >
                            ✓ {perm?.label || permId}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
