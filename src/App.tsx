import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import ChatPage from './components/ChatPage';
import { AdminPanel } from './components/AdminPanel';
import { OverviewCards } from './components/OverviewCards';
import { WorkloadHeatmap } from './components/WorkloadHeatmap';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintTable } from './components/ComplaintTable';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { ActivityFeed } from './components/ActivityFeed';
import { ToastProvider, useToast } from './components/ui/Toast';
import { 
  Search, 
  Bell, 
  Calendar,
  ChevronDown,
  Sun,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Info,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

const PlaceholderPage: React.FC<{ title: string, description: string }> = ({ title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center justify-center py-32 text-center h-[60vh]"
    >
      <div className="w-16 h-16 bg-[#ff6b00]/10 rounded-3xl flex items-center justify-center mb-6 border border-[#ff6b00]/20">
         <Info className="w-8 h-8 text-[#ff6b00]" />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tighter mb-4">{title}</h1>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-sm">{description}</p>
    </motion.div>
  );
};

import { useAuth } from './contexts/AuthContext';

import { ProfileView } from './components/ProfileView';

import { NotificationCenter } from './components/NotificationCenter';

function InnerApp() {
  const { profile, signOut, isLoading, role } = useAuth();
  const userName = profile?.name || 'User';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0807] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff6b00]/20 border-t-[#ff6b00] rounded-full animate-spin shadow-[0_0_30px_rgba(255,107,0,0.1)]" />
      </div>
    );
  }
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toast = useToast();

  const rolePermissions: Record<string, string[]> = {
    dashboard: ['student', 'department_staff', 'admin', 'super_admin'],
    new: ['student', 'super_admin'],
    history: ['student', 'department_staff', 'admin', 'super_admin'],
    messages: ['student', 'department_staff', 'admin', 'super_admin'],
    profile: ['student', 'department_staff', 'admin', 'super_admin'],
    maintenance: ['department_staff', 'admin', 'super_admin'],
    tasks: ['department_staff', 'admin', 'super_admin'],
    analytics: ['admin', 'super_admin'],
  };

  React.useEffect(() => {
    if (role && rolePermissions[activePage] && !rolePermissions[activePage].includes(role)) {
      setActivePage('dashboard');
      toast("Access Restricted", "You do not have permission for this sector.");
    }
  }, [activePage, role]);

  const [dateModifier, setDateModifier] = useState(0);
  const currentMonthDate = new Date();
  currentMonthDate.setMonth(currentMonthDate.getMonth() + dateModifier);

  const prevMonth = () => setDateModifier(p => p - 1);
  const nextMonth = () => setDateModifier(p => p + 1);

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; 

  const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonthDate.getMonth() && today.getFullYear() === currentMonthDate.getFullYear();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-[#0a0807] selection:bg-[#ff6b00]/30 font-sans text-slate-400">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onSignOut={signOut}
        role={role}
      />
      
      <main className="flex-1 lg:ml-72 flex flex-col p-6 lg:p-10 relative overflow-hidden">
        {/* Top Navbar */}
        <header className="flex justify-between items-center mb-16 relative z-20">
          <div className="flex items-center gap-6 w-full max-w-4xl">
            <div className="relative group w-full lg:max-w-md">
              <input 
                type="text" 
                placeholder="Search operational metadata..." 
                className="bg-[#12100f] border border-[#221c1a] rounded-2xl px-6 py-3 text-xs font-bold placeholder:text-slate-700 text-slate-300 w-full focus:ring-1 focus:ring-[#ff6b0030] focus:outline-none transition-all"
                onClick={() => toast("Search Context", "Global neural index is currently updating.")}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-[#ff6b00] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-6 border-r border-white/5">
              <div 
                onClick={() => setTheme(p => p === 'dark' ? 'light' : 'dark')} 
                className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-600 hover:text-white transition-all cursor-pointer hidden sm:flex"
              >
                <Sun className="w-5 h-5" />
              </div>
              <NotificationCenter />
            </div>
            
            <div className="flex items-center gap-4">
               <div 
                 className="flex flex-col items-end hidden md:flex"
               >
                 <span className="text-xs font-black uppercase tracking-widest text-white leading-none">{userName}</span>
                 <span className="text-[9px] font-bold uppercase tracking-widest text-[#ff6b00] leading-none mt-1">
                   {role === 'super_admin' ? 'Super Administrator' :
                    role === 'admin' ? 'Administrative Lead' : 
                    role === 'department_staff' ? 'Departmental Staff' : 
                    'Verified Student'}
                 </span>
               </div>
               <div 
                 className="cursor-pointer hover:ring-2 hover:ring-[#ff6b00/30] transition-all rounded-2xl p-0.5 border border-white/10"
                 onClick={() => setActivePage('profile')}
               >
                 <img 
                   src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} 
                   alt="Profile" 
                   className="w-10 h-10 rounded-2xl object-cover"
                 />
               </div>
               <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-500"
              >
                <LayoutGrid className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="relative z-10 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(5px)' }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              className="flex-1"
            >
              {activePage === 'dashboard' ? (
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <img 
                      src="/CoreLOz_6_-removebg-preview.png" 
                      alt="VVCE Logo" 
                      className="w-20 h-20 object-contain brightness-110 drop-shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                    />
                    <div className="space-y-2">
                       <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] leading-tight">Hi, {userName}!</h2>
                       <h1 className="text-4xl font-black text-white tracking-tighter leading-tight">VVCE Corelogs</h1>
                       <p className="text-xs font-black text-[#ff6b00] uppercase tracking-[0.2em]">Next Gen AI Powered Complaints Hub</p>
                    </div>
                  </div>

                  <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between p-6 bg-[#ff6b0008] border border-[#ff6b0015] rounded-[32px] overflow-hidden relative group"
                  >
                      <div className="absolute inset-y-0 left-0 w-1 bg-[#ff6b00]" />
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-[#ff6b0010] border border-[#ff6b0020] rounded-2xl flex items-center justify-center text-[#ff6b00]">
                           <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-[#ff6b00] uppercase tracking-[0.2em] mb-1">AI Operations Center Active</p>
                           <h3 className="text-base md:text-lg font-black text-white tracking-tight leading-[1.2] italic max-w-2xl">
                              All systems operational. Global neural mesh predicts 14% improvement in resolution efficiency this week.
                           </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 hidden lg:flex shrink-0">
                         <div className="px-4 py-2 bg-white/[0.03] rounded-xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Confidence</p>
                            <p className="text-sm font-black text-emerald-500 tracking-tighter leading-none">98.4%</p>
                         </div>
                         <button onClick={() => toast("Syncing...", "Dispatching optimization sub-routines...")} className="px-5 py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors">
                            Operational Sync
                         </button>
                      </div>
                   </motion.div>

                   <OverviewCards />

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                     <div className="xl:col-span-8 space-y-8">
                       <WorkloadHeatmap />
                       <ActivityFeed />
                     </div>
                     
                     <div className="xl:col-span-4 bg-[#12100f] border border-[#221c1a] rounded-[40px] p-8 space-y-10">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{monthName}</span>
                          </div>
                          <div className="flex gap-4">
                            <ChevronLeft className="w-4 h-4 text-slate-600 cursor-pointer hover:text-white" onClick={prevMonth} />
                            <ChevronRight className="w-4 h-4 text-slate-600 cursor-pointer hover:text-white" onClick={nextMonth} />
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="grid grid-cols-7 gap-1 text-center">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                              <span key={d} className="text-[9px] font-black text-slate-700 uppercase tracking-tighter pb-4">{d}</span>
                            ))}
                            {Array.from({length: offset}, (_, i) => (
                              <div key={`empty-${i}`} className="py-3"></div>
                            ))}
                            {daysArray.map((n) => {
                              const isToday = isCurrentMonth && today.getDate() === n;
                              return (
                                <div key={n} onClick={() => toast("Date details", `Detailed schedule for ${monthName} ${n} is empty.`)} className={cn(
                                  "py-3 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center relative",
                                  isToday ? "bg-[#ff6b00] text-white shadow-lg shadow-orange-950/20" : "text-slate-500 hover:text-white hover:bg-white/[0.02]"
                                )}>
                                  {n}
                                </div>
                              );
                            })}
                          </div>

                          <div className="space-y-4">
                             <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl relative group hover:border-[#ff6b0030] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                     <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Network Maintenance</p>
                                     <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Router replacement in Block C...</p>
                                  </div>
                                  <MoreHorizontal onClick={() => toast("Task options", "Additional options are restricted for this task.")} className="w-4 h-4 text-slate-600 cursor-pointer hover:text-white transition-colors" />
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                   <div className="flex -space-x-2">
                                      {[1, 2, 3].map(i => (
                                        <img key={i} className="w-6 h-6 rounded-full border-2 border-[#12100f]" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=eng${i}`} alt="" />
                                      ))}
                                   </div>
                                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">09:30 AM</span>
                                </div>
                             </div>

                             <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl relative group hover:border-[#ff6b0030] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                     <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Electrical Audit</p>
                                     <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Annual safety check for hostels...</p>
                                  </div>
                                  <MoreHorizontal onClick={() => toast("Task options", "Additional options are restricted for this task.")} className="w-4 h-4 text-slate-600 cursor-pointer hover:text-white transition-colors" />
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                   <div className="flex -space-x-2">
                                      {[4, 5].map(i => (
                                        <img key={i} className="w-6 h-6 rounded-full border-2 border-[#12100f]" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=eng${i}`} alt="" />
                                      ))}
                                   </div>
                                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">07:15 AM</span>
                                </div>
                             </div>
                             
                             <button 
                               onClick={() => setActivePage('new')}
                               className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                             >
                                + File a report
                             </button>
                          </div>
                        </div>
                     </div>
                  </div>
                </div>
              ) : activePage === 'new' ? (
                <ComplaintForm onSuccess={() => setActivePage('history')} />
              ) : activePage === 'history' ? (
                <div className="space-y-10">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h2 className="text-4xl font-black text-white tracking-tighter leading-tight">Live Audit Log</h2>
                         <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Realtime Active</span>
                         </div>
                      </div>
                   </div>
                  <ComplaintTable />
                </div>
              ) : activePage === 'messages' ? (
                <ChatPage />
              ) : activePage === 'maintenance' ? (
                <PlaceholderPage 
                   title="Maintenance Overview" 
                   description="View schedule logic, resource availability, and generic maintenance tasks directly reported by system sensors."
                />
              ) : activePage === 'tasks' ? (
                <AdminPanel />
              ) : activePage === 'analytics' ? (
                <div className="space-y-10">
                   <div className="space-y-2">
                     <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] leading-tight">Analytics</h2>
                     <h1 className="text-4xl font-black text-white tracking-tighter leading-tight">Statistics & Analysis</h1>
                  </div>
                  <AnalyticsCharts />
                </div>
              ) : activePage === 'profile' ? (
                <ProfileView />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

import { ComplaintProvider } from './contexts/ComplaintContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AuthScreen from './components/AuthScreen';

export default function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <ToastProvider>
          <NotificationProvider>
            <AuthScreen>
              <InnerApp />
            </AuthScreen>
          </NotificationProvider>
        </ToastProvider>
      </ComplaintProvider>
    </AuthProvider>
  )
}
