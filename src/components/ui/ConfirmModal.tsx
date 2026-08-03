'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد الإجراء',
  cancelText = 'إلغاء',
  type = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
    },
    warning: {
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    },
    info: {
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border mb-1.5 ${style.badge}`}>
              تأكيد الإجراء
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-bold rounded-md shadow-xs transition-colors disabled:opacity-50 ${style.button}`}
          >
            {loading ? 'جاري التنفيذ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
