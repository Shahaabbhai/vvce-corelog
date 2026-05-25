import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { APP_LOGO_URL } from '../constants';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Lock, Mail, Server } from 'lucide-react';

const AuthScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0807] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0a0807] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#151110] border border-white/10 rounded-[40px] p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-[#ff6b00]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#ff6b00]/20">
             <Server className="w-8 h-8 text-[#ff6b00]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter">Database Required</h2>
          <p className="text-slate-400 text-sm font-medium">To run this application, you must configure Supabase by adding <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to your environment variables.</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role
            }
          }
        });
        if (error) throw error;
        // Auto sign-in or alert to check email
        if (!error && !user) {
          setError('Account created! Depending on your settings, you may need to confirm your email.');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0807] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#151110] border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b00] rounded-full blur-[100px] opacity-[0.15] -translate-y-1/2 translate-x-1/3"></div>

        <div className="relative z-10 space-y-8">
          <div className="flex justify-center mb-4">
            <img 
              src={APP_LOGO_URL} 
              alt="Logo" 
              className="w-24 h-24 object-contain brightness-110" 
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">{isLogin ? 'Welcome back' : 'Create account'}</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isLogin ? 'Log in to manage campus issues' : 'Join the campus network'}</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-4">
                <input 
                  type="text" 
                  required
                  placeholder="Full Name" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#0a0807] border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium text-white focus:outline-none focus:border-[#ff6b00]/50 transition-colors"
                />
                <div className="flex gap-4">
                  <div 
                    onClick={() => setRole('student')}
                    className={`flex-1 py-3 text-center border rounded-2xl cursor-pointer transition-colors text-xs font-black uppercase tracking-widest ${role === 'student' ? 'border-[#ff6b00] bg-[#ff6b00]/10 text-white' : 'border-white/5 text-slate-500 hover:bg-white/5'}`}
                  >
                    Student
                  </div>
                  <div 
                    onClick={() => setRole('admin')}
                    className={`flex-1 py-3 text-center border rounded-2xl cursor-pointer transition-colors text-xs font-black uppercase tracking-widest ${role === 'admin' ? 'border-[#ff6b00] bg-[#ff6b00]/10 text-white' : 'border-white/5 text-slate-500 hover:bg-white/5'}`}
                  >
                    Admin
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input 
                type="email" 
                required
                placeholder="Email Address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0a0807] border border-white/5 rounded-2xl pl-16 pr-6 py-4 text-sm font-medium text-white focus:outline-none focus:border-[#ff6b00]/50 transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input 
                type="password" 
                required
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0a0807] border border-white/5 rounded-2xl pl-16 pr-6 py-4 text-sm font-medium text-white focus:outline-none focus:border-[#ff6b00]/50 transition-colors"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-xs font-bold text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-white hover:text-[#ff6b00] transition-colors uppercase tracking-widest"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
