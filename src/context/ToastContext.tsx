import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, Flame } from 'lucide-react';

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

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto delete after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Floating toast notification stack container */}
      <div 
        id="toast-stack-container" 
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      >
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
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300
                    ${isSuccess 
                      ? 'bg-slate-900/95 border-emerald-500/30 text-white shadow-emerald-950/20' 
                      : isError 
                        ? 'bg-slate-900/95 border-rose-500/30 text-white shadow-rose-950/20'
                        : isWarning 
                          ? 'bg-slate-900/95 border-amber-500/30 text-white shadow-amber-950/20'
                          : 'bg-slate-900/95 border-indigo-500/30 text-white shadow-indigo-950/20'
                    }
                  `}
                >
                  {/* Visual Icons */}
                  <div className="shrink-0 mt-0.5">
                    {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {isError && <AlertCircle className="w-5 h-5 text-rose-450" />}
                    {isWarning && <Flame className="w-5 h-5 text-amber-450" />}
                    {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-indigo-400" />}
                  </div>

                  {/* Message body text */}
                  <div className="flex-1 text-xs leading-relaxed font-sans font-medium text-slate-100">
                    {toast.message}
                  </div>

                  {/* Manual Close Trigger button */}
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="shrink-0 text-slate-400 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
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
