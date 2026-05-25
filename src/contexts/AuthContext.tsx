import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

type Role = 'student' | 'department_staff' | 'admin' | 'super_admin' | null;

interface Profile {
  id: string;
  name: string;
  role: Role;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: Role;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_K));

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async (uid: string, email: string | undefined) => {
      console.log("Fetching profile for UID:", uid, "Email:", email);
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', uid).single();
        const isAdminEmail = email === 'shahaab.dns@gmail.com';
        
        if (!error && data) {
          // If the user's email is the admin email, ensure they have at least 'admin' role if not already super_admin
          let finalRole = data.role;
          if (isAdminEmail && data.role !== 'super_admin' && data.role !== 'admin') {
            finalRole = 'super_admin';
            // Silently update if needed
            await supabase.from('users').update({ role: 'super_admin' }).eq('id', uid);
          }
          setProfile({ ...data, role: finalRole });
          setRole(finalRole as Role);
        } else if (error) {
          // Handle specific errors
          if (error.code === 'PGRST116') {
             // Profile missing, create it
             console.log("No profile found, creating for:", uid);
             const nameFromMetadata = email?.split('@')[0] || 'User';
             const initialRole = isAdminEmail ? 'super_admin' : 'student';
             const { data: created, error: insertError } = await supabase.from('users').insert({
               id: uid,
               name: nameFromMetadata,
               role: initialRole,
               email: email
             }).select().single();
             
             if (!insertError && created) {
               setProfile(created);
               setRole(created.role);
             } else {
               // Fallback if insertion fails
               const fallback = { id: uid, name: nameFromMetadata, role: initialRole as Role, email: email };
               setProfile(fallback);
               setRole(fallback.role);
             }
          }
        }
      } catch (err: any) {
        if (err.message === 'Failed to fetch') {
          console.error("Supabase connection failed. Please check your internet or if the Supabase project is active.");
        } else {
          console.error("Error fetching profile:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.email);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.email);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  useEffect(() => {
    if (!user || !isConfigured) return;

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        setProfile(payload.new as Profile);
        setRole((payload.new as Profile).role);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, isConfigured]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { data, error } = await supabase.from('users').update(updates).eq('id', user.id).select().single();
    if (!error && data) {
      setProfile(data);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, isLoading, signOut, updateProfile, isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
