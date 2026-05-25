import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, Shield, Zap } from 'lucide-react';

export const AIProcessingOverlay: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0a0807]/95 backdrop-blur-2xl"
    >
      <div className="max-w-md w-full px-8 flex flex-col items-center gap-12 text-center">
        <div className="relative">
          {/* Neural Network Pulse */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -inset-12 bg-[#ff6b00] rounded-full blur-[60px]"
          />
          
          <div className="relative w-32 h-32 bg-[#151210] border border-[#ff6b0030] rounded-[40px] flex items-center justify-center overflow-hidden shadow-2xl">
             <motion.div
               animate={{ 
                 rotate: 360,
                 scale: [1, 1.1, 1]
               }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-gradient-to-tr from-[#ff6b0010] to-transparent"
             />
             <Sparkles className="w-12 h-12 text-[#ff6b00] animate-pulse" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
             <h2 className="text-3xl font-black text-white tracking-tighter">AI Processing</h2>
             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">VVCE Intel Engine is deconstructing your report...</p>
          </div>

          <div className="flex flex-col gap-3">
             <LoadingStep icon={<Brain className="w-4 h-4" />} label="Linguistic Analysis" progress={85} />
             <LoadingStep icon={<Shield className="w-4 h-4" />} label="Priority Mapping" progress={60} />
             <LoadingStep icon={<Zap className="w-4 h-4" />} label="Department Routing" progress={30} />
          </div>
        </div>

        <div className="pt-8 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#ff6b00] rounded-full animate-ping" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Neural Link</span>
        </div>
      </div>
    </motion.div>
  );
};

const LoadingStep = ({ icon, label, progress }: { icon: React.ReactNode, label: string, progress: number }) => (
  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
     <div className="text-[#ff6b00]">{icon}</div>
     <div className="flex-1 text-left">
        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{label}</p>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
             className="h-full bg-[#ff6b00]"
           />
        </div>
     </div>
  </div>
);
