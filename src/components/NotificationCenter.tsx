import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, AlertTriangle, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const notifications = [
    { id: 1, type: 'alert', title: 'Network Outage detected', body: 'Campus Block B AI nodes reporting connectivity drops.', time: '2m ago' },
    { id: 2, type: 'info', title: 'System Optimized', body: 'Department IT workload balanced by AI.', time: '14m ago' },
    { id: 3, type: 'success', title: 'Issue Resolved', body: 'Electrical fault in Library fixed.', time: '1h ago' },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-2xl bg-[#ff6b0010] border border-[#ff6b0020] flex items-center justify-center text-[#ff6b00] hover:bg-[#ff6b0020] transition-all relative group"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-[#12100f] rounded-full" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-[#12100f] border border-[#221c1a] rounded-[32px] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Active Notifications</h3>
                <MoreHorizontal className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
              </div>

              <div className="p-2 max-h-[400px] overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 hover:bg-white/[0.02] rounded-2xl transition-all cursor-pointer group mb-1">
                    <div className="flex gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        n.type === 'alert' ? "bg-rose-500/10 text-rose-500" :
                        n.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-[#ff6b0010] text-[#ff6b00]"
                      )}>
                        {n.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> :
                         n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-black text-white tracking-tight">{n.title}</h4>
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{n.time}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{n.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white/[0.02] text-center border-t border-white/5">
                <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-[#ff6b00] transition-colors">Clear all alerts</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
