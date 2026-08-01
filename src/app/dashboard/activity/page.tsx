import { prisma } from '@/lib/prisma';
import { formatRelativeTime, ACTION_LABELS, ROLE_LABELS } from '@/lib/utils';

export default async function ActivityPage() {
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, role: true } } },
  });

  const actionColors: Record<string, string> = {
    CREATE: 'bg-success-bg text-success',
    UPDATE: 'bg-info-bg text-info',
    DELETE: 'bg-danger-bg text-danger',
    LOGIN: 'bg-primary-50 text-primary',
    LOGOUT: 'bg-surface-secondary text-text-muted',
    PRINT: 'bg-warning-bg text-warning',
    EXPORT: 'bg-salary-bg text-salary',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">سجل النشاط</h1>
        <p className="text-sm text-text-muted mt-1">تتبع جميع العمليات في النظام</p>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">لا توجد أنشطة بعد</div>
      ) : (
        <div className="space-y-2 stagger-children">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-surface border border-border rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-medium flex-shrink-0 mt-0.5 ${actionColors[activity.action] || 'bg-surface-secondary text-text-muted'}`}>
                  {ACTION_LABELS[activity.action] || activity.action}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-text-primary">{activity.user.name}</span>
                    <span className="text-text-muted">—</span>
                    <span className="text-text-secondary">{activity.entityType}</span>
                  </div>
                  {activity.details && (
                    <p className="text-xs text-text-muted mt-1 truncate">
                      {(() => {
                        try {
                          const d = JSON.parse(activity.details);
                          return Object.entries(d).map(([k, v]) => `${k}: ${v}`).join('، ');
                        } catch { return activity.details; }
                      })()}
                    </p>
                  )}
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">{formatRelativeTime(activity.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
