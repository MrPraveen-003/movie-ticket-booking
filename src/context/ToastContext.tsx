import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Flame, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const TOAST_LIFETIME_MS = 4500;
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_LIFETIME_MS);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      <div id="toast-stack-container" className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className="pointer-events-auto w-full"
              >
                <div
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 ${
                    isSuccess
                      ? 'border-emerald-500/30 bg-slate-900/95 text-white shadow-emerald-950/20'
                      : isError
                        ? 'border-rose-500/30 bg-slate-900/95 text-white shadow-rose-950/20'
                        : isWarning
                          ? 'border-amber-500/30 bg-slate-900/95 text-white shadow-amber-950/20'
                          : 'border-indigo-500/30 bg-slate-900/95 text-white shadow-indigo-950/20'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                    {isError && <AlertCircle className="h-5 w-5 text-rose-450" />}
                    {isWarning && <Flame className="h-5 w-5 text-amber-450" />}
                    {!isSuccess && !isError && !isWarning && <Info className="h-5 w-5 text-indigo-400" />}
                  </div>

                  <div className="flex-1 text-xs font-medium leading-relaxed text-slate-100">
                    {toast.message}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="shrink-0 cursor-pointer rounded-lg p-0.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be mounted inside a ToastProvider');
  }
  return context;
};
