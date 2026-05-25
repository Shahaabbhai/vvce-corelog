import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info } from 'lucide-react';

interface ToastContextType {
  toast: (title: string, description?: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [toasts, setToasts] = useState<{id: number, title: string, description?: string}[]>([]);

  const toast = (title: string, description?: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const clearToasts = () => {
    setToasts(() => []);
  };

  return (
    <ToastContext.Provider value={{ toast, clearToasts }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(t => (
             <motion.div
               key={t.id}
               initial={{ opacity: 0, x: 50, scale: 0.9 }}
               animate={{ opacity: 1, x: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
               className="bg-[#12100f] border border-[#221c1a] rounded-2xl p-4 flex gap-4 items-start min-w-[300px] max-w-md shadow-2xl backdrop-blur-xl"
             >
                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                  <Info className="w-4 h-4 text-[#ff6b00]" />
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{t.title}</h4>
                  {t.description && <p className="text-xs font-bold text-slate-500 mt-2 leading-tight">{t.description}</p>}
                </div>
                <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-slate-600 hover:text-white mt-1 transition-colors">
                  <X className="w-4 h-4" />
                </button>
             </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be within ToastProvider");
  return ctx.toast;
}

export const useToastActions = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastManager must be within ToastProvider");
  return { toast: ctx.toast, clearToasts: ctx.clearToasts };
}
