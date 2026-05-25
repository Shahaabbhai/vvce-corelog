import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, Filter, ChevronDown, Clock, AlertCircle, Save, Building2, ClipboardCheck, X } from 'lucide-react';
import { useComplaints } from '../contexts/ComplaintContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/Toast';
import { cn } from '../lib/utils';
import { Complaint } from '../types';
import { ComplaintWorkflow } from './ComplaintWorkflow';

const DEPARTMENTS = [
  'IT Support', 'Electrical', 'Maintenance', 'Hostel', 'Security', 'Library', 'Academic', 'Transport'
];

export const AdminPanel: React.FC = () => {
  const { complaints, updateWorkflow, assignToDepartment } = useComplaints();
  const { role, user, profile } = useAuth();
  const toast = useToast();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const isStaff = role === 'department_staff';
  const isAdmin = role === 'admin' || role === 'super_admin';

  // Filter complaints based on role
  const filteredComplaints = complaints.filter(c => {
    if (isAdmin) return true;
    if (isStaff) return c.assigned_department === profile?.department;
    return false;
  });

  const handleUpdateTech = async (id: string) => {
    if (!techInput.trim()) return;
    await assignToDepartment(id, profile?.department || 'General', techInput.trim());
    setEditingId(null);
    setTechInput('');
    toast('Assignment Updated', 'Technician assigned successfully.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case 'In Progress': return "text-[#ff6b00] bg-[#ff6b00]/10 border-[#ff6b00]/20";
      case 'Assigned': return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case 'Escalated': return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      default: return "text-slate-500 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex items-center justify-between pb-8 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-4">
            {isAdmin ? 'Central Command' : `${profile?.department || 'Department'} Hub`}
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
            {isAdmin ? 'System-wide infrastructure audit and dispatch operations.' : 'Departmental task queue and resolution tracking.'}
          </p>
        </div>
        {isAdmin && (
           <div className="flex gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[120px]">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Queue Depth</p>
                 <p className="text-xl font-black text-white">{complaints.filter(c => c.status === 'Pending').length}</p>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-center min-w-[120px]">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Weekly MTTR</p>
                 <p className="text-xl font-black text-emerald-500">14.2h</p>
              </div>
           </div>
        )}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-[#151110] border border-[#221c1a] rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Operational Queue</h2>
              <div className="flex gap-4 items-center">
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{filteredComplaints.length} TASKS MATCHED</span>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {filteredComplaints.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                    <ClipboardCheck className="w-8 h-8" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No active traffic in this perimeter.</p>
                </div>
              )}
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="p-8 hover:bg-white/[0.01] transition-all border-l-4 border-transparent hover:border-[#ff6b00] flex items-start justify-between gap-8 group">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                        getStatusColor(complaint.status)
                      )}>
                        {complaint.status}
                      </span>
                      <h3 className="text-lg font-black text-slate-200 group-hover:text-white transition-colors">#{complaint.id.split('-')[0].toUpperCase()}</h3>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{complaint.category}</span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">{complaint.description}</p>
                    <div className="flex items-center gap-6 pt-2">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                         <Building2 className="w-3.5 h-3.5" />
                         {complaint.assigned_department || 'UNASSIGNED'}
                       </div>
                       
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest group/tech">
                         <UserCheck className="w-3.5 h-3.5" />
                         {isStaff ? (
                            editingId === complaint.id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  value={techInput}
                                  onChange={e => setTechInput(e.target.value)}
                                  placeholder="Staff ID..."
                                  className="bg-black border border-white/10 rounded-xl px-3 py-1 text-white text-[10px] focus:outline-none focus:border-[#ff6b00]"
                                />
                                <button onClick={() => handleUpdateTech(complaint.id)} className="text-[#ff6b00] hover:text-white transition-colors"><Save className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <span 
                                className="cursor-pointer hover:text-[#ff6b00] transition-colors" 
                                onClick={() => { setEditingId(complaint.id); setTechInput(complaint.assigned_staff_id || ''); }}
                              >
                                {complaint.assigned_staff_id || 'Self Assign (Click)'}
                              </span>
                            )
                         ) : (
                            <span>{complaint.assigned_staff_id || 'Staff Pending'}</span>
                         )}
                       </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-5">
                    <button 
                      onClick={() => setSelectedComplaint(complaint)}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff6b00] hover:border-[#ff6b00] transition-all"
                    >
                      Audit Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <section className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-2 italic">Priority Faults</h2>
            <div className="space-y-5">
              {complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved' && c.status !== 'Closed').map((comp) => (
                <div 
                  key={comp.id} 
                  onClick={() => setSelectedComplaint(comp)}
                  className="flex flex-col gap-4 p-6 rounded-[24px] bg-[#151110] border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer group shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-lg">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Immediate</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">{comp.category}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-1">{comp.description}</p>
                  </div>
                </div>
              ))}
              {complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved' && c.status !== 'Closed').length === 0 && (
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No immediate faults</p>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-2 italic">Workload Map</h2>
            <div className="bg-[#151110] border border-white/5 rounded-[32px] p-6 space-y-4">
               {DEPARTMENTS.slice(0, 5).map(dept => {
                 const count = complaints.filter(c => c.assigned_department === dept && c.status !== 'Closed').length;
                 return (
                   <div key={dept} className="space-y-2">
                     <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                       <span>{dept}</span>
                       <span>{count} TASKS</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-[#ff6b00] transition-all duration-1000" 
                         style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                       />
                     </div>
                   </div>
                 );
               })}
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
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

                <ComplaintWorkflow 
                  complaint={selectedComplaint} 
                  onUpdate={() => {
                    const updated = complaints.find(c => c.id === selectedComplaint.id);
                    if (updated) setSelectedComplaint(updated);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
