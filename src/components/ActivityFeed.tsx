import React from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle2, AlertCircle, MessageSquare, Activity } from 'lucide-react';
import { useComplaints } from '../contexts/ComplaintContext';
import { cn } from '../lib/utils';

export const ActivityFeed: React.FC = () => {
  const { complaints } = useComplaints();

  const activities = React.useMemo(() => {
    // Combine complaints and some simulated system events for a rich feed
    const list = complaints.slice(0, 5).map(c => ({
      id: c.id,
      type: 'complaint',
      title: 'New Issue Logged',
      description: c.description,
      time: c.created_at,
      status: c.status,
      category: c.category,
      urgency: c.ai_urgency_score,
      icon: c.status === 'Resolved' ? CheckCircle2 : AlertCircle
    }));

    // Add some simulated AI system events
    const systemEvents = [
      {
        id: 'sys-1',
        type: 'system',
        title: 'Neural Mesh Optimization',
        description: 'AI core re-balanced IT department workload based on recent priority surge.',
        time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'Info',
        category: 'System',
        icon: Activity
      },
      {
        id: 'sys-2',
        type: 'system',
        title: 'Network Node Security',
        description: 'Auto-scan complete. All 24 security nodes in East Wing reporting STABLE.',
        time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        status: 'Info',
        category: 'Security',
        icon: Activity
      }
    ];

    return [...list, ...systemEvents].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [complaints]);

  return (
    <div className="bg-[#12100f] border border-[#221c1a] rounded-[40px] p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ff6b0010] rounded-xl">
            <Activity className="w-5 h-5 text-[#ff6b00]" />
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Live Activity Feed</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
        {activities.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No recent traffic</p>
          </div>
        )}
        {activities.map((activity, idx) => {
          const Icon = activity.icon;
          return (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ 
                delay: idx * 0.1, 
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1] 
              }}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              className="flex gap-6 group relative"
            >
              <div className="relative z-10">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#12100f] transition-all group-hover:scale-110",
                  activity.status === 'Resolved' ? "bg-emerald-500 text-white" : 
                  activity.type === 'system' ? "bg-[#ff6b0010] text-[#ff6b00]" : "bg-white/5 text-slate-500"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 pb-6 border-b border-white/5 group-last:border-none">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-black text-white tracking-tight">{activity.title}</h4>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed line-clamp-2 italic mb-3">"{activity.description}"</p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    activity.type === 'system' ? "bg-pink-500/10 text-pink-500 border-pink-500/20" : "bg-[#ff6b0010] text-[#ff6b00] border-[#ff6b0020]"
                  )}>
                    {activity.category}
                  </span>
                  {(activity as any).urgency !== undefined && (
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {(activity as any).urgency}% Urgency
                    </span>
                  )}
                  <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                    {activity.type === 'system' ? 'INTELLIGENCE NODE' : `ID: ${activity.id.split('-')[0]}`}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
