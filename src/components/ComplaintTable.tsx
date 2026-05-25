import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, MoreHorizontal, X, RefreshCw, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { useComplaints } from '../contexts/ComplaintContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/Toast';
import { Complaint } from '../types';

import { ComplaintWorkflow } from './ComplaintWorkflow';

export const ComplaintTable: React.FC = () => {
  const { complaints, loading, updateComplaintStatus, refreshComplaints } = useComplaints();
  const { role } = useAuth();
  const toast = useToast();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]";
      case 'In Progress':
      case 'Accepted':
        return "bg-[#ff6b00] shadow-[0_0_5px_rgba(255,107,0,0.5)]";
      case 'Assigned':
        return "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]";
      case 'Waiting Verification':
        return "bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]";
      case 'Reopened':
      case 'Escalated':
        return "bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]";
      default:
        return "bg-slate-600";
    }
  };

  console.log("Rendering ComplaintTable, complaints count:", complaints.length, "loading:", loading);

  return (
    <>
      <div className="momentum-glass rounded-[40px] overflow-hidden relative z-10">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                 <Filter className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">Live Sync Active</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{complaints.length} Records Found</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  refreshComplaints();
                  toast("Syncing...", "Fetching latest audit records.");
                }}
                className="p-2.5 bg-white/5 text-slate-400 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all group"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
              <div className="relative group hidden sm:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 transition-colors group-focus-within:text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search audit log..." 
                   className="bg-white/[0.02] border border-white/5 rounded-full py-2 pl-10 pr-4 text-[11px] text-slate-300 focus:outline-none focus:border-white/10 transition-all placeholder:text-slate-700 w-64"
                 />
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Assignee</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Urgency</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading && complaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCw className="w-6 h-6 text-[#ff6b00] animate-spin" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing core logs...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && complaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center text-slate-500 text-sm font-bold uppercase tracking-widest">
                    No issues documented
                  </td>
                </tr>
              )}
              {complaints.map((complaint, idx) => (
                <motion.tr 
                  key={complaint.id} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-400 font-mono tracking-tighter">#{complaint.id.split('-')[0].toUpperCase()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-100 line-clamp-1 max-w-xs">{complaint.description}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      {complaint.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {complaint.assigned_department || 'UNASSIGNED'}
                      </span>
                      {complaint.assigned_staff_id && (
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{complaint.assigned_staff_id}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest leading-none mb-1",
                        complaint.priority === 'High' ? "text-rose-500" : complaint.priority === 'Medium' ? "text-[#ff6b00]" : "text-emerald-500"
                      )}>
                        {complaint.priority}
                      </span>
                      {complaint.ai_urgency_score !== undefined && (
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{complaint.ai_urgency_score}% Score</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(complaint.status))}></div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{complaint.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right relative z-20">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedComplaint(complaint);
                       }}
                       className="p-2 opacity-0 group-hover:opacity-100 transition-all text-slate-500 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5"
                     >
                        <MoreHorizontal className="w-4 h-4" />
                     </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0807]/80 backdrop-blur-md"
            onClick={() => setSelectedComplaint(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-[#151110] border border-white/10 rounded-[40px] p-8 md:p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter mb-2">Ref: #{selectedComplaint.id.split('-')[0].toUpperCase()}</h3>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-widest">{new Date(selectedComplaint.created_at).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="text-xs font-bold uppercase tracking-widest">{selectedComplaint.status}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Description</h4>
                  <p className="text-lg font-medium text-slate-200 leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Category</h4>
                    <p className="text-lg font-black text-white">{selectedComplaint.category}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Urgency</h4>
                    <p className={cn(
                      "text-lg font-black",
                      selectedComplaint.priority === 'High' ? "text-rose-500" : selectedComplaint.priority === 'Medium' ? "text-[#ff6b00]" : "text-emerald-500"
                    )}>
                      {selectedComplaint.priority}
                    </p>
                  </div>
                </div>

                {/* New Workflow Actions Section */}
                <ComplaintWorkflow 
                  complaint={selectedComplaint} 
                  onUpdate={() => {
                    const updated = complaints.find(c => c.id === selectedComplaint.id);
                    if (updated) setSelectedComplaint(updated);
                  }}
                />

                {selectedComplaint.ai_explanation && (
                  <div className="bg-[#ff6b00]/10 border border-[#ff6b00]/20 rounded-[32px] p-8 space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-[#ff6b00] uppercase tracking-widest mb-2">AI Summary</h4>
                      <p className="text-base font-black text-white leading-tight">
                        {selectedComplaint.ai_summary || "Automated analysis in progress..."}
                      </p>
                    </div>
                    
                    <div className="flex gap-8 border-t border-[#ff6b0010] pt-6 flex-wrap">
                      <div className="flex-1 min-w-[120px]">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Urgency Matrix</h4>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-[#ff6b00]" 
                               style={{ width: `${selectedComplaint.ai_urgency_score || 50}%` }}
                             />
                          </div>
                          <span className="text-[10px] font-black text-white">{selectedComplaint.ai_urgency_score || 50}%</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sentiment</h4>
                        <p className="text-xs font-bold text-white uppercase">{selectedComplaint.ai_sentiment || 'Neutral'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Fix</h4>
                        <p className="text-xs font-bold text-white uppercase">{selectedComplaint.resolution_estimate || 2}h</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Confidence</h4>
                        <p className="text-xs font-bold text-emerald-500 tracking-tighter">
                          {((selectedComplaint.ai_confidence_score || 0.94) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {selectedComplaint.is_duplicate && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4">
                        <div className="shrink-0 text-rose-500"><EyeOff className="w-4 h-4" /></div>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Similarity Cluster detected with reference {selectedComplaint.duplicate_ref || 'PENDING'}</p>
                      </div>
                    )}

                    <div className="p-4 bg-black/20 rounded-2xl border border-[#ff6b0010]">
                       <p className="text-[11px] font-medium text-slate-400 italic leading-relaxed">
                         "{selectedComplaint.ai_explanation}"
                       </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
