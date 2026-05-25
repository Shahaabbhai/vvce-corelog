import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { LayoutGrid, RotateCcw } from 'lucide-react';
import { useToast } from './ui/Toast';
import { useComplaints } from '../contexts/ComplaintContext';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DEPARTMENTS = ['IT', 'Elec', 'Facil', 'Secur', 'Gen'];

export const WorkloadHeatmap: React.FC = () => {
  const { complaints } = useComplaints();
  const toast = useToast();

  const data = useMemo(() => {
    // 5 departments x 14 day window
    const grid = DEPARTMENTS.map(() => Array(14).fill(0));
    const now = new Date();
    
    complaints.forEach(c => {
      const cDate = new Date(c.created_at);
      const diffTime = Math.abs(now.getTime() - cDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 14) {
        const deptIdx = DEPARTMENTS.indexOf(c.department?.substring(0, 5) || 'Gen');
        if (deptIdx !== -1) {
          grid[deptIdx][13 - diffDays] += 1;
        }
      }
    });

    return grid;
  }, [complaints]);

  return (
    <div className="bg-[#12100f] border border-[#221c1a] rounded-[40px] p-8 lg:p-10 space-y-10 group">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-xl">
             <LayoutGrid className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Department Activity Intensity</h3>
            <div className="flex items-center gap-4 mt-4">
              {[
                { label: 'Idle', color: 'bg-white/5' },
                { label: 'Stabilizing', color: 'bg-[#ff6b00]/30' },
                { label: 'Active Issues', color: 'bg-[#ff6b00]/60' },
                { label: 'Peak Maintenance', color: 'bg-[#ff6b00]' }
              ].map((level) => (
                <div key={level.label} className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", level.color)}></div>
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{level.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span onClick={() => toast("Feature disabled", "Detailed heatmap analysis is not active yet.")} className="text-[10px] font-black text-slate-500 hover:text-white transition-colors cursor-pointer uppercase tracking-widest">View all</span>
          <RotateCcw onClick={() => toast("Refreshing", "Fetching new heatmap data source...")} className="w-4 h-4 text-slate-600 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Y-Axis */}
        <div className="flex flex-col gap-3 pr-6 border-r border-white/5 pt-1">
          {DEPARTMENTS.map(dept => (
            <div key={dept} className="h-8 flex items-center justify-end text-[10px] font-black text-slate-700 tracking-tighter uppercase">
              {dept}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex-1 overflow-x-auto scrollbar-hide pb-4">
          <div className="flex flex-col gap-3 min-w-[500px]">
             {data.map((row, i) => (
               <div key={i} className="flex gap-2">
                 {row.map((val, j) => (
                   <motion.div
                     key={j}
                     initial={{ opacity: 0, scale: 0.9 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     transition={{ delay: (i * 0.05) + (j * 0.01) }}
                     className={cn(
                       "h-8 flex-1 rounded-sm transition-all duration-300",
                       val === 0 && "bg-white/[0.03]",
                       val === 1 && "bg-[#ff6b00]/20",
                       val === 2 && "bg-[#ff6b00]/50",
                       val >= 3 && "bg-[#ff6b00] shadow-[0_0_15px_rgba(255,107,0,0.2)]"
                     )}
                   />
                 ))}
               </div>
             ))}
             
             {/* X-Axis Labels */}
             <div className="flex gap-2 mt-4 ml-1">
               {Array.from({ length: 14 }).map((_, idx) => (
                 <div key={idx} className="flex-1 text-center text-[10px] font-black text-slate-700 tracking-tighter">
                   T-{13-idx}d
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
