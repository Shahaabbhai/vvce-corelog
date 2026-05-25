import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  AlertTriangle, 
  Send, 
  ClipboardCheck,
  History,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Complaint, Role } from '../types';
import { useComplaints } from '../contexts/ComplaintContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/Toast';

const DEPARTMENTS = [
  'IT Support',
  'Electrical',
  'Maintenance',
  'Hostel',
  'Security',
  'Library',
  'Academic',
  'Transport'
];

interface WorkflowProps {
  complaint: Complaint;
  onUpdate?: () => void;
}

export const ComplaintWorkflow: React.FC<WorkflowProps> = ({ complaint, onUpdate }) => {
  const { assignToDepartment, updateWorkflow, updateComplaintStatus } = useComplaints();
  const { user, role } = useAuth();
  const toast = useToast();

  const [notes, setNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedDept, setSelectedDept] = useState(complaint.assigned_department || '');
  const [staffId, setStaffId] = useState(complaint.assigned_staff_id || '');

  // Sync state with props for real-time updates
  React.useEffect(() => {
    setSelectedDept(complaint.assigned_department || '');
    setStaffId(complaint.assigned_staff_id || '');
  }, [complaint.assigned_department, complaint.assigned_staff_id]);

  const handleAssign = async () => {
    if (!selectedDept) {
      toast("Error", "Please select a department");
      return;
    }
    await assignToDepartment(complaint.id, selectedDept, staffId);
    toast("Task Assigned", `Complaint assigned to ${selectedDept} department.`);
    setIsAssigning(false);
    onUpdate?.();
  };

  const handleStatusChange = async (newStatus: Complaint['status'], extraUpdates: Partial<Complaint> = {}) => {
    await updateWorkflow(complaint.id, { 
      status: newStatus,
      ...extraUpdates
    });
    toast("Status Updated", `Complaint is now ${newStatus}`);
    setNotes('');
    onUpdate?.();
  };

  const isStaff = role === 'department_staff';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isStudent = role === 'student';

  // Logic for showing different action panels
  const canAdminAssign = isAdmin && (complaint.status === 'Pending' || complaint.status === 'Reopened');
  const canStaffAccept = isStaff && complaint.status === 'Assigned' && complaint.assigned_department === user?.department;
  const canStaffProgress = isStaff && (complaint.status === 'Accepted' || complaint.status === 'In Progress') && complaint.assigned_staff_id === user?.id;
  const canStaffResolve = isStaff && (complaint.status === 'In Progress') && complaint.assigned_staff_id === user?.id;
  const canAdminVerify = isAdmin && complaint.status === 'Waiting Verification';
  const canStudentConfirm = isStudent && complaint.status === 'Resolved';

  return (
    <div className="space-y-6">
      {/* Workflow Timeline Visualization */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <History className="w-3.5 h-3.5" />
          Lifecycle Timeline
        </h4>
        <div className="relative flex justify-between items-start">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/5 -z-0"></div>
          {[
            { label: 'Pending', active: true },
            { label: 'Assigned', active: ['Assigned', 'Accepted', 'In Progress', 'Waiting Verification', 'Resolved', 'Closed', 'Escalated'].includes(complaint.status) },
            { label: 'In Progress', active: ['In Progress', 'Waiting Verification', 'Resolved', 'Closed'].includes(complaint.status) },
            { label: 'Resolved', active: ['Resolved', 'Closed'].includes(complaint.status) },
            { label: 'Closed', active: complaint.status === 'Closed' }
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 relative z-10 w-1/5">
              <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                step.active 
                  ? "bg-[#ff6b00] border-[#ff6b00] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]" 
                  : "bg-[#151110] border-white/10 text-slate-600"
              )}>
                {step.active ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest text-center",
                step.active ? "text-white" : "text-slate-600"
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Panels */}
      <div className="space-y-4">
        {/* Admin Assignment Panel */}
        {canAdminAssign && (
          <div className="bg-[#ff6b0008] border border-[#ff6b0015] rounded-[32px] p-8 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#ff6b0015] border border-[#ff6b0020] flex items-center justify-center text-[#ff6b00]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white tracking-tight">Dispatch Operations</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assign task to a department for resolution.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Target Department</label>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-[11px] font-black text-white focus:outline-none focus:border-[#ff6b00]/50"
                >
                  <option value="">Select Department...</option>
                  {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Specific Staff ID (Optional)</label>
                <input 
                  type="text" 
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="e.g. ENG-402"
                  className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-[11px] font-black text-white focus:outline-none focus:border-[#ff6b00]/50"
                />
              </div>
            </div>

            <button 
              onClick={handleAssign}
              className="w-full py-4 bg-[#ff6b00] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-orange-950/20 flex items-center justify-center gap-3"
            >
              <Send className="w-4 h-4" />
              Initialize Assignment
            </button>
          </div>
        )}

        {/* Staff Accept Panel */}
        {canStaffAccept && (
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-[32px] p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white tracking-tight">Assignment Notification</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">This task has been assigned to your department.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleStatusChange('Accepted', { assigned_staff_id: user?.id })}
                className="flex-1 py-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all"
              >
                Accept Task
              </button>
              <button 
                onClick={() => handleStatusChange('Pending', { assigned_department: null, assigned_by_id: null })}
                className="flex-1 py-4 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
              >
                Reject / Delegate
              </button>
            </div>
          </div>
        )}

        {/* Staff Progress/Resolve Panel */}
        {(canStaffProgress || canStaffResolve) && (
          <div className="bg-[#ff6b0008] border border-[#ff6b0015] rounded-[32px] p-8 space-y-6">
             <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Resolution Console</h4>
                <div className="px-3 py-1 bg-[#ff6b0010] border border-[#ff6b0020] rounded-full text-[8px] font-black text-[#ff6b00] uppercase">Active Session</div>
             </div>

             <textarea 
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder="Add resolution details, work progress, or technical notes..."
               className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[13px] font-medium text-slate-300 min-h-[120px] focus:outline-none focus:border-[#ff6b00]/30 transition-all"
             />

             <div className="flex gap-4">
                {complaint.status !== 'In Progress' && (
                  <button 
                    onClick={() => handleStatusChange('In Progress')}
                    className="flex-1 py-3 bg-white/5 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                  >
                    Start Working
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (!notes) return toast("Error", "Please provide resolution notes");
                    handleStatusChange('Waiting Verification', { resolution_notes: notes });
                  }}
                  className="flex-1 py-3 bg-[#ff6b00] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-xl shadow-orange-950/20"
                >
                  Mark Resolved
                </button>
             </div>
          </div>
        )}

        {/* Admin Verification Panel */}
        {canAdminVerify && (
          <div className="bg-[#ff6b0008] border border-[#ff6b0015] rounded-[32px] p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ff6b0015] border border-[#ff6b0020] flex items-center justify-center text-[#ff6b00]">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white tracking-tight">Resolution Verification</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">A resolution has been submitted. Review and approve.</p>
              </div>
            </div>

            <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Resolution Notes</p>
              <p className="text-sm font-medium text-slate-300">{complaint.resolution_notes}</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => handleStatusChange('Resolved', { verification_status: 'Approved' })}
                className="flex-1 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-lg shadow-emerald-950/20"
              >
                Approve & Close
              </button>
              <button 
                onClick={() => {
                  if (!notes) return toast("Error", "Please provide reason for reopening");
                  handleStatusChange('Reopened', { reopened_reason: notes, verification_status: 'Rejected' });
                }}
                className="flex-1 py-3 bg-white/5 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-white/10"
              >
                Reject & Reopen
              </button>
              <button 
                onClick={() => {
                  if (!notes) return toast("Action Required", "Explain escalation reason in notes.");
                  handleStatusChange('Escalated', { escalation_note: notes });
                }}
                className="flex-1 py-3 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-rose-500/20 hover:bg-rose-500/20"
              >
                Escalate
              </button>
            </div>
            
            {complaint.status === 'Waiting Verification' && (
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for rejection (if applicable)..."
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[13px] font-medium text-slate-300 min-h-[80px] focus:outline-none focus:border-[#ff6b00]/30 transition-all"
              />
            )}
          </div>
        )}

        {/* Student Confirmation Panel */}
        {canStudentConfirm && (
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-[32px] p-8 space-y-6">
            <h4 className="text-base font-black text-white tracking-tight text-center">Has your issue been resolved?</h4>
            <div className="flex gap-4">
              <button 
                onClick={() => handleStatusChange('Closed', { student_feedback: 'Resolved' })}
                className="flex-1 py-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Yes, it's resolved
              </button>
              <button 
                onClick={() => {
                   if (!notes) return toast("Action Required", "Please let us know why it isn't resolved.");
                   handleStatusChange('Reopened', { reopened_reason: notes, student_feedback: 'Not Resolved' });
                }}
                className="flex-1 py-4 bg-white/5 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-white/10 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                No, Reopen Issue
              </button>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Feedback or reason for reopening..."
              className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[13px] font-medium text-slate-300 min-h-[80px] focus:outline-none"
            />
          </div>
        )}

        {/* Status Display for Completed/Escalated */}
        {complaint.status === 'Closed' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] p-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-black text-white tracking-tight">Case Closed</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Resolution confirmed and verified by all parties.</p>
            </div>
          </div>
        )}

        {/* Info/Context Display */}
        <div className="grid grid-cols-2 gap-4">
           {complaint.assigned_department && (
             <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-600" />
                <div>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Department</p>
                   <p className="text-[11px] font-black text-slate-300">{complaint.assigned_department}</p>
                </div>
             </div>
           )}
           {complaint.assigned_staff_id && (
             <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-slate-600" />
                <div>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Assigned Staff</p>
                   <p className="text-[11px] font-black text-slate-300">{complaint.assigned_staff_id}</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
