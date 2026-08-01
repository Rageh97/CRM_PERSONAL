'use client';

import { useState } from 'react';
import { formatRelativeTime, ACTION_LABELS } from '@/lib/utils';

const ITEMS_PER_PAGE = 20;

export function ActivityClient({ activities }: { activities: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(currentPage, totalPages);

  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const paginated = activities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const actionColors: Record<string, string> = {
    CREATE: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
    UPDATE: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
    DELETE: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
    LOGIN: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
    LOGOUT: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
    PRINT: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
    EXPORT: 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">سجل النشاط والأمان</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تتبع كافة العمليات وحركات النظام بالتفصيل</p>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-500 text-xs font-medium">
          لا توجد أنشطة مسجلة بعد
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {paginated.map((activity) => (
              <div key={activity.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3.5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-start gap-3">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold border flex-shrink-0 mt-0.5 ${actionColors[activity.action] || 'bg-slate-100 text-slate-700'}`}>
                    {ACTION_LABELS[activity.action] || activity.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{activity.user?.name || 'مستخدم'}</span>
                      <span className="text-slate-400">—</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{activity.entityType}</span>
                    </div>
                    {activity.details && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {(() => {
                          try {
                            const d = JSON.parse(activity.details);
                            return Object.entries(d).map(([k, v]) => `${k}: ${v}`).join('، ');
                          } catch { return activity.details; }
                        })()}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0 font-medium">{formatRelativeTime(activity.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Corporate Pagination Bar */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 dark:text-slate-400 font-semibold">
                عرض الصفحة <span className="font-bold text-slate-900 dark:text-white">{validPage}</span> من إجمالي{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">{totalPages}</span> صفحات ({activities.length} سجل)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={validPage === 1}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  السابق
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-md font-bold text-xs transition-colors ${
                        p === validPage
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={validPage === totalPages}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
