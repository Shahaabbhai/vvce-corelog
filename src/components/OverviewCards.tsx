import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  IterationCcw,
  Target,
  Video,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useToast } from './ui/Toast';
import { useComplaints } from '../contexts/ComplaintContext';

interface CardProps {
  label: string;
  value: string;
  icon: any;
  trend: string;
  isPositive: boolean;
  color: string;
  delay?: number;
}

const StatCard: React.FC<CardProps> = ({ label, value, icon: Icon, trend, isPositive, color, delay = 0 }) => {
  const toast = useToast();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
      className="bg-[#12100f] border border-[#221c1a] rounded-[32px] p-6 lg:p-8 flex flex-col justify-between group transition-all duration-300 hover:border-white/10"
    >
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-white" />
          <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">{label}</span>
          <span onClick={() => toast("Feature disabled", `Viewing all details for ${label} is not available.`)} className="text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">View all</span>
        </div>
        <Maximize2 onClick={() => toast("Feature disabled", `Expanding ${label} card is currently unavailable.`)} className="w-4 h-4 text-slate-600 cursor-pointer hover:text-white transition-colors" />
      </div>
      
      <div className="space-y-4">
        <p className="text-4xl font-extrabold text-white tracking-tighter leading-none">{value}</p>
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
          <span className={cn(isPositive ? "text-emerald-500" : "text-rose-500")}>
            {trend}
          </span>
          <span className="text-slate-600">from previous weeks</span>
        </div>
      </div>
    </motion.div>
  );
};

export const OverviewCards: React.FC = () => {
  const toast = useToast();
  const { complaints } = useComplaints();

  const stats = useMemo(() => {
    const active = complaints.filter(c => c.status !== 'Resolved').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const resolvedToday = complaints.filter(c => c.status === 'Resolved' && new Date(c.created_at).toISOString().split('T')[0] === todayStr).length;

    const avgResValue = complaints.length > 0 ? (complaints.reduce((acc, curr) => acc + (curr.resolution_estimate || 2), 0) / complaints.length).toFixed(1) : '2.1';
    const networkIssues = complaints.filter(c => c.category === 'Network' && c.status !== 'Resolved').length;
    const networkHealth = Math.max(0, 100 - (networkIssues * 8)).toFixed(1);
    
    // AI Sentiment Summary
    const sentiments = complaints.map(c => c.ai_sentiment || 'Neutral');
    const dominantSentiment = sentiments.length > 0 
      ? Object.entries(sentiments.reduce((acc: any, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {}))
          .sort((a, b) => (b[1] as number) - (a[1] as number))[0][0]
      : 'Optimal';

    const aiEfficiency = complaints.length > 0 
      ? Math.round(complaints.filter(c => c.ai_summary).length / complaints.length * 100)
      : 0;

    return {
      total: complaints.length,
      active,
      resolvedToday,
      avgRes: avgResValue + 'h',
      networkHealth: networkHealth + '%',
      dominantSentiment,
      resolvedPercentage: complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0,
      aiEfficiency
    };
  }, [complaints]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Operations Chart Card */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-4 bg-[#12100f] border border-[#221c1a] rounded-[40px] p-10 flex flex-col justify-between relative overflow-hidden h-[360px] group"
         >
            <div className="flex justify-between items-start z-10">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl group-hover:bg-[#ff6b0010] transition-colors">
                    <RefreshCw className="w-4 h-4 text-slate-300 group-hover:text-[#ff6b00]" />
                  </div>
                  <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Active Traffic</span>
               </div>
               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-[#ff6b00] uppercase tracking-widest bg-[#ff6b0010] px-3 py-1 rounded-full border border-[#ff6b0020] animate-pulse">Live</span>
               </div>
            </div>

            <div className="mt-8 z-10">
              <h4 className="text-6xl font-black text-white tracking-tighter mb-2">{stats.total}</h4>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">Total operational requests processed<br/>via core intelligence nodes.</p>
            </div>
            
            <div className="h-28 w-full flex items-end gap-1 px-2 z-10 relative mt-6">
                {[45, 60, 45, 90, 65, 80, 55, 30, 45, 70, 50, 40].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/[0.03] rounded-full relative overflow-hidden group/bar">
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${h}%` }}
                       className={cn(
                         "absolute bottom-0 w-full transition-all duration-700",
                         i === 7 || i === 8 ? "bg-[#ff6b00] shadow-[0_0_20px_rgba(255,107,0,0.3)]" : "bg-[#332a22] group-hover/bar:bg-[#ff6b0030]"
                       )}
                     />
                  </div>
                ))}
            </div>
         </motion.div>

         {/* AI Campus Intelligence Hero */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-8 relative rounded-[40px] overflow-hidden group h-[360px] border border-[#221c1a]"
         >
            <div className="absolute inset-0 bg-[#0c0a09]"></div>
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#ff6b0015_0%,transparent_50%)]"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-[120%] h-[120%] border-[40px] border-[#ff6b0005] rounded-full blur-3xl animate-pulse"></div>
               <div className="absolute w-[90%] h-[90%] border-2 border-[#ff6b0010] rounded-full"></div>
               <div className="absolute w-[70%] h-[70%] border border-[#ff6b0008] rounded-full"></div>
            </div>

            <div className="relative h-full flex flex-col justify-between p-10 lg:p-12 z-10">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md">
                    <IterationCcw className="w-4 h-4 text-[#ff6b00]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Campus Sentiment: <span className="text-[#ff6b00]">{stats.dominantSentiment}</span></span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <Maximize2 className="w-4 h-4 text-slate-500" />
                  </div>
               </div>

               <div className="max-w-xl">
                  <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-6 leading-[1] italic">Predictive Intelligence Active</h3>
                  <div className="flex flex-wrap gap-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resolution Propensity</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{stats.resolvedPercentage}% Efficiency</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Critical Nodes</p>
                        <p className="text-2xl font-black text-rose-500 tracking-tighter">{stats.active} Nodes Active</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Health</p>
                        <p className="text-2xl font-black text-emerald-500 tracking-tighter">{stats.networkHealth}</p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] max-w-sm leading-relaxed">
                    AI node processing {stats.total} concurrent complaints. Escalation protocol level: STABLE.
                  </p>
                  <button onClick={() => toast("Sync Command Sent", "Dispatching optimization sub-routines...")} className="flex items-center gap-2 pr-2 pl-6 py-2 bg-[#ff6b00] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all shadow-xl shadow-[#ff6b0020] group/btn">
                    Optimize Operations
                    <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center group-hover/btn:bg-black/80 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
               </div>
            </div>
         </motion.div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Active Issues" value={stats.active.toString()} icon={IterationCcw} trend="+12%" isPositive={false} color="bg-rose-500" delay={0.1} />
        <StatCard label="AI Efficiency" value={stats.aiEfficiency + "%"} icon={Zap} trend="+8.4%" isPositive={true} color="bg-[#ff6b00]" delay={0.2} />
        <StatCard label="Avg Response" value={stats.avgRes} icon={Clock} trend="-15%" isPositive={true} color="bg-emerald-500" delay={0.3} />
        <StatCard label="Resolved Today" value={stats.resolvedToday.toString()} icon={CheckCircle2} trend="+5%" isPositive={true} color="bg-emerald-500" delay={0.4} />
      </div>
    </div>
  );
};
