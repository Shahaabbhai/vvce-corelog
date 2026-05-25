import React from 'react';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export const SystemHealth: React.FC = () => {
  return (
    <div className="p-6 border-t border-white/5 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Security</span>
          </div>
          <span className="text-[9px] font-black text-emerald-500 uppercase">Secure</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <span>AI Node Load</span>
            <span className="text-white">24%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '24%' }}
              className="h-full bg-[#ff6b00]" 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <span>Mesh Response</span>
            <span className="text-white">12ms</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '15%' }}
              className="h-full bg-emerald-500" 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
         <div className="relative">
            <Cpu className="w-4 h-4 text-slate-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 border-2 border-[#0c0a09] rounded-full" />
         </div>
         <div className="flex flex-col">
            <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none mb-1">Core Prime</span>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">Status: Operational</span>
         </div>
      </div>
    </div>
  );
};
