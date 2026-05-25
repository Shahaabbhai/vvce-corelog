import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Complaint, Category, Priority } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ComplaintContextType {
  complaints: Complaint[];
  loading: boolean;
  totalUnreadMessages: number;
  addComplaint: (
    desc: string, 
    category: string, 
    priority: string, 
    explanation: string, 
    department: string, 
    isAnonymous: boolean, 
    imageUrl?: string | null,
    aiData?: {
      summary?: string;
      sentiment?: string;
      resolution_estimate?: number;
      urgency_score?: number;
      confidence_score?: number;
      is_duplicate?: boolean;
      duplicate_ref?: string;
    }
  ) => Promise<void>;
  analyzeComplaint: (description: string, imageBase64?: string, mimeType?: string) => Promise<any>;
  updateComplaintStatus: (id: string, newStatus: string) => Promise<void>;
  assignToDepartment: (id: string, department: string, staffId?: string) => Promise<void>;
  updateWorkflow: (id: string, updates: Partial<Complaint>) => Promise<void>;
  deleteComplaint: (id: string) => Promise<void>;
  refreshComplaints: () => Promise<void>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const { user, profile, role, isConfigured } = useAuth();

  const fetchUnreadCount = async () => {
    if (!isConfigured || !user) return;
    try {
      // Students count unread messages from non-students (staff/admins)
      // Staff/Admins count unread messages from students
      const isStudent = role === 'student';
      
      let query = supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (isStudent) {
        query = query.neq('sender_role', 'student');
      } else {
        query = query.eq('sender_role', 'student');
      }

      const { data, error, count } = await query;
      
      if (!error && count !== null) {
        setTotalUnreadMessages(count);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const fetchComplaints = async () => {
    if (!isConfigured) return;
    setLoading(true);
    try {
      console.log("Fetching complaints for role:", role, "user:", user?.id);
      let query = supabase.from('complaints').select('*').order('created_at', { ascending: false });
      
      // Role-based visibility
      if (role === 'student' && user) {
        query = query.eq('user_id', user.id);
      } else if (role === 'department_staff' && profile?.department) {
        // Staff only see their department
        query = query.eq('department', profile.department);
      }
      // Admins and Super Admins see everything (no filter needed)
      
      const { data, error } = await query;
      if (!error && data) {
        setComplaints(data);
      } else if (error) {
        console.error("Error fetching complaints:", error);
      }
      
      await fetchUnreadCount();
    } catch (err) {
      console.error("Fetch complaints catch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConfigured && user) {
      fetchComplaints();

      const complaintSub = supabase
        .channel('complaints_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
          fetchComplaints();
        })
        .subscribe();

      const messageSub = supabase
        .channel('messages_realtime_unread')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
          fetchUnreadCount();
        })
        .subscribe();

      return () => {
        complaintSub.unsubscribe();
        messageSub.unsubscribe();
      };
    }
  }, [user, role, isConfigured]);

  const addComplaint = async (
    desc: string, 
    category: string, 
    priority: string, 
    explanation: string, 
    department: string, 
    isAnonymous: boolean, 
    imageUrl?: string | null,
    aiData?: {
      summary?: string;
      sentiment?: string;
      resolution_estimate?: number;
      urgency_score?: number;
      confidence_score?: number;
      is_duplicate?: boolean;
      duplicate_ref?: string;
    }
  ) => {
    if (!user || !isConfigured) return;
    
    try {
      // Primary attempt: Include all AI intelligence metadata
      const { data, error } = await supabase.from('complaints').insert({
        description: desc,
        category,
        priority,
        department,
        status: 'Pending',
        is_anonymous: isAnonymous,
        user_id: user.id,
        ai_explanation: explanation,
        ai_summary: aiData?.summary,
        ai_sentiment: aiData?.sentiment,
        resolution_estimate: aiData?.resolution_estimate,
        ai_urgency_score: aiData?.urgency_score,
        ai_confidence_score: aiData?.confidence_score,
        is_duplicate: aiData?.is_duplicate,
        duplicate_ref: aiData?.duplicate_ref,
        image_url: imageUrl || null
      }).select().single();

      if (error) {
        // Fallback: If AI columns are missing in DB, insert with core fields only
        if (error.message?.includes('column') || error.code === '42703') {
          console.warn("DB Schema mismatch: Falling back to core columns.");
          const { data: fallbackData, error: fallbackError } = await supabase.from('complaints').insert({
            description: desc,
            category,
            priority,
            department,
            status: 'Pending',
            is_anonymous: isAnonymous,
            user_id: user.id,
            ai_explanation: explanation,
            image_url: imageUrl || null
          }).select().single();
          
          if (fallbackError) throw fallbackError;
          if (fallbackData) {
            setComplaints(prev => [fallbackData, ...prev]);
            return fallbackData;
          }
        }
        throw error;
      }
      
      if (data) {
        setComplaints(prev => [data, ...prev]);
        return data; 
      }
    } catch (error: any) {
      console.error("Error inserting complaint:", error);
      throw error;
    }
  };

  const analyzeComplaint = async (description: string, imageBase64?: string, mimeType?: string) => {
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description, 
          imageBase64, 
          mimeType,
          existingComplaints: complaints.slice(0, 10).map(c => ({ desc: c.description, cat: c.category }))
        }),
      });
      if (!response.ok) throw new Error('AI analysis failed');
      return await response.json();
    } catch (err) {
      console.error("AI Analysis error:", err);
      // Return a basic structure as fallback
      return {
        category: 'Other',
        priority: 'Medium',
        department: 'General',
        urgency_score: 50,
        resolution_estimate: 24,
        sentiment: 'Neutral',
        summary: 'Analyzing issue...',
        explanation: 'AI classification temporarily unavailable.',
        confidence_score: 0,
        is_duplicate: false
      };
    }
  };

  const deleteComplaint = async (id: string) => {
    if (!isConfigured) return;
    try {
      const { error } = await supabase.from('complaints').delete().eq('id', id);
      if (error) throw error;
      setComplaints(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      console.error("Delete error:", error);
      alert("Delete failed: " + error.message);
    }
  };

  const updateComplaintStatus = async (id: string, newStatus: string) => {
    if (!isConfigured) return;
    const { data, error } = await supabase.from('complaints').update({ 
      status: newStatus, 
      updated_at: new Date().toISOString() 
    }).eq('id', id).select().single();
    if (!error && data) {
       setComplaints(prev => prev.map(c => c.id === data.id ? data : c));
    }
  };

  const assignToDepartment = async (id: string, department: string, staffId?: string) => {
    if (!isConfigured || !user) return;
    
    // We update both sets of naming conventions to ensure persistence across potential schema variations
    const updates: any = { 
      assigned_department: department,
      department: department, // legacy/standard column
      assigned_staff_id: staffId || null,
      assigned_to: staffId || null, // legacy/standard column
      assigned_by_id: user.id,
      assignment_timestamp: new Date().toISOString(),
      status: 'Assigned',
      updated_at: new Date().toISOString() 
    };

    const { data, error } = await supabase.from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && data) {
       setComplaints(prev => prev.map(c => c.id === data.id ? data : c));
    } else if (error) {
      console.error("Assignment error:", error);
      // Fallback: If some columns failed, try updating only core columns
      if (error.message?.includes('column')) {
        const { data: retryData, error: retryError } = await supabase.from('complaints')
          .update({
            department: department,
            assigned_to: staffId || null,
            status: 'Assigned',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
          
        if (!retryError && retryData) {
          setComplaints(prev => prev.map(c => c.id === retryData.id ? retryData : c));
        }
      }
    }
  };

  const updateWorkflow = async (id: string, updates: Partial<Complaint>) => {
    if (!isConfigured) return;
    const { data, error } = await supabase.from('complaints').update({ 
      ...updates,
      updated_at: new Date().toISOString() 
    }).eq('id', id).select().single();
    
    if (!error && data) {
       setComplaints(prev => prev.map(c => c.id === data.id ? data : c));
    } else if (error) {
      console.error("Workflow update error:", error);
    }
  };

  const refreshComplaints = async () => {
    await fetchComplaints();
  };

  return (
    <ComplaintContext.Provider value={{ 
      complaints, 
      loading, 
      totalUnreadMessages, 
      addComplaint, 
      analyzeComplaint,
      updateComplaintStatus, 
      assignToDepartment,
      updateWorkflow,
      deleteComplaint, 
      refreshComplaints 
    }}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const ctx = useContext(ComplaintContext);
  if (!ctx) throw new Error('useComplaints must be used within ComplaintProvider');
  return ctx;
};
