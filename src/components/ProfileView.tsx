import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Mail, Calendar, Edit2, Check, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useComplaints } from '../contexts/ComplaintContext';
import { cn } from '../lib/utils';

export const ProfileView: React.FC = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { complaints } = useComplaints();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');

  const stats = [
    { label: 'Issues Logged', value: complaints.length },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length },
    { label: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length },
  ];

  const handleSave = async () => {
    await updateProfile({ name: newName });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">My Profile</h2>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
          Manage your campus identity and track your contribution status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#121214] border border-white/5 rounded-[32px] p-8 flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#ff6b00] p-1">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} 
                  alt="Profile" 
                  className="w-full h-full rounded-full bg-[#1a1a1e]"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#ff6b00] p-2 rounded-full border-4 border-[#121214] text-white">
                <User className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1 w-full">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold text-center focus:outline-none focus:border-[#ff6b00]"
                  />
                  <button onClick={handleSave} className="bg-green-500 p-2 rounded-xl text-white hover:bg-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="bg-white/5 p-2 rounded-xl text-white hover:bg-white/10">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">{profile?.name}</h3>
                  <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-[#ff6b00] transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <Shield className={cn(
                  "w-3 h-3", 
                  (profile?.role === 'admin' || profile?.role === 'super_admin') ? "text-amber-500" : 
                  profile?.role === 'department_staff' ? "text-[#ff6b00]" : "text-blue-500"
                )} />
                <span>{profile?.role?.replace('_', ' ')} account</span>
              </div>
              {profile?.department && (
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">
                  Dept: {profile.department}
                </div>
              )}
            </div>

            <button 
              onClick={() => signOut()}
              className="w-full h-12 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-white/5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats and Info */}
        <div className="md:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#121214] border border-white/5 rounded-[24px] p-6 text-center"
              >
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Details */}
          <div className="bg-[#121214] border border-white/5 rounded-[32px] p-8 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Contact Information</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Email Address</span>
                </div>
                <div className="text-white font-bold">{user?.email}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Account Created</span>
                </div>
                <div className="text-white font-bold">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Placeholder */}
          <div className="bg-[#ff6b00]/5 border border-[#ff6b00]/20 rounded-[32px] p-8 text-center space-y-4">
            <h4 className="text-sm font-black text-[#ff6b00] uppercase tracking-widest">Campus Karma</h4>
            <p className="text-slate-400 text-sm font-medium">You've helped solve {complaints.filter(c => c.status === 'Resolved').length} major campus issues. Keep it up!</p>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#ff6b00]" 
                style={{ width: `${Math.min((complaints.filter(c => c.status === 'Resolved').length / 10) * 100, 100)}%` }}
              />
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Level {Math.floor(complaints.filter(c => c.status === 'Resolved').length / 5) + 1} Contributor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
