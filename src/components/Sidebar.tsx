import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  Box, 
  ShoppingBag, 
  FileText, 
  MessageSquare,
  CheckSquare,
  Sparkles,
  Zap,
  X,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from './ui/Toast';

import { Role } from '../types';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSignOut?: () => void;
  role?: Role | null;
}

import { useComplaints } from '../contexts/ComplaintContext';
import { APP_LOGO_URL } from '../constants';

import { SystemHealth } from './SystemHealth';

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen, onSignOut, role }) => {
  const toast = useToast();
  const { complaints, totalUnreadMessages } = useComplaints();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, group: 'GENERAL', roles: ['student', 'department_staff', 'admin', 'super_admin'] },
    { id: 'new', label: 'New Complaint', icon: Sparkles, group: 'GENERAL', roles: ['student', 'super_admin'] },
    { id: 'history', label: 'Audit Log', icon: FileText, group: 'GENERAL', count: complaints.length.toString(), roles: ['student', 'department_staff', 'admin', 'super_admin'] },
    { id: 'messages', label: 'In-app Chat', icon: MessageSquare, group: 'GENERAL', count: totalUnreadMessages > 0 ? totalUnreadMessages.toString() : undefined, isBadge: totalUnreadMessages > 0, roles: ['student', 'department_staff', 'admin', 'super_admin'] },
    { id: 'profile', label: 'Profile Settings', icon: User, group: 'GENERAL', roles: ['student', 'department_staff', 'admin', 'super_admin'] },
    { id: 'maintenance', label: 'Maintenance', icon: Box, group: 'MORE', roles: ['department_staff', 'admin', 'super_admin'] },
    { id: 'tasks', label: 'Admin Tasks', icon: CheckSquare, group: 'MORE', roles: ['admin', 'super_admin'] },
    { id: 'analytics', label: 'Statistics', icon: ShoppingBag, group: 'MORE', count: '13', roles: ['admin', 'super_admin'] },
  ];

  const filteredItems = menuItems.filter(item => !role || item.roles.includes(role));

  const interactions = [
    { name: 'Dann Petty', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dann' },
    { name: 'Flux Academy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Flux' },
    { name: 'Michelle Choi', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michelle' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed left-0 top-0 h-full w-72 bg-[#0c0a09] border-r border-white/5 flex flex-col z-50 transition-transform duration-500 ease-in-out lg:translate-x-0 overflow-y-auto scrollbar-hide",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <img 
                src={APP_LOGO_URL} 
                alt="Logo" 
                className="w-10 h-10 object-contain transition-transform group-hover:scale-110 duration-500" 
              />
              <div className="absolute inset-0 bg-[#ff6b00]/20 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-tighter block leading-tight">VVCE Corelogs</span>
              <span className="text-[10px] font-bold text-slate-500 block leading-tight uppercase tracking-widest">NEXT GEN AI HUB</span>
            </div>
          </div>
          <button className="lg:hidden text-slate-500" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-10">
          {/* General Section */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">General</p>
            {filteredItems.filter(i => i.group === 'GENERAL').map((item) => {
              const isActive = activePage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-[#ff6b00]/10 text-white" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className={cn(
                      "w-4 h-4 transition-all duration-500",
                      isActive ? "text-white scale-110" : "text-slate-600 group-hover:text-[#ff6b00]"
                    )} />
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  {item.count && (
                    <span className={cn(
                      "relative z-10 flex items-center justify-center rounded-full font-black uppercase tracking-tighter transition-all duration-500",
                      (item as any).isBadge 
                        ? "min-w-[18px] h-[18px] px-1 bg-[#ff6b00] text-white text-[8px] animate-pulse shadow-lg shadow-orange-500/40" 
                        : isActive ? "text-[10px] text-white" : "text-[10px] text-slate-600 group-hover:text-slate-400"
                    )}>
                      {item.count}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-nav-bg"
                      className="absolute inset-0 bg-[#ff6b00] rounded-xl -z-0"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-[-1.5rem] w-1.5 h-6 bg-[#ff6b00] rounded-r-full shadow-[0_0_15px_rgba(255,107,0,0.5)]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* More Section */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">More</p>
            {filteredItems.filter(i => i.group === 'MORE').map((item) => {
              const isActive = activePage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group",
                    isActive ? "text-white" : "text-slate-500 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactions Section */}
          {(role === 'admin' || role === 'super_admin' || role === 'department_staff') && (
            <div className="space-y-1">
              <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Interactions</p>
              <div className="space-y-1">
                {interactions.map((person) => (
                  <div key={person.name} onClick={() => toast("Chat unavailable", `Direct messaging with ${person.name} is disabled.`)} className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.02] rounded-xl transition-all cursor-pointer group">
                    <div className="relative">
                      <img src={person.avatar} className="w-6 h-6 rounded-full border border-white/10" alt="" />
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-[#0c0a09] rounded-full"></span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-300">{person.name}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => toast("Contacts locked", "You are not authorized to view all interaction contacts.")} className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 group">
                 <span>Show more (14)</span>
                 <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </nav>

        <div className="p-6">
          {(role === 'admin' || role === 'super_admin') && (
            <div onClick={() => toast("PRO Plan Required", "Contact administration to upgrade your account.")} className="bg-[#ff6b00]/10 border border-[#ff6b00]/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-[#ff6b00]/20 transition-all group mb-4">
               <div className="p-2 bg-[#ff6b00] rounded-xl text-white shadow-lg shadow-orange-500/20">
                 <Zap className="w-4 h-4 fill-white" />
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.1em]">Upgrade to PRO</span>
               </div>
            </div>
          )}

          {(role === 'admin' || role === 'super_admin') && <SystemHealth />}

          {onSignOut && (
            <button 
              onClick={() => onSignOut()}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all text-xs font-semibold group"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
