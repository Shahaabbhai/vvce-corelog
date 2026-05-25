import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import { Complaint } from '../types';

interface NotificationContextType {
  // We can add more specific notification methods here if needed
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, profile } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;

    // Subscribe to complaint updates
    const channel = supabase
      .channel('complaint_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints'
        },
        (payload) => {
          const oldData = payload.old as Complaint;
          const newData = payload.new as Complaint;

          // Notify based on role
          notifyUser(newData, oldData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role, profile]);

  const notifyUser = (newComplaint: Complaint, oldComplaint: Complaint) => {
    // 1. Assignment Notifications (Target: Staff)
    if (newComplaint.status === 'Assigned' && oldComplaint.status !== 'Assigned') {
      if (role === 'department_staff' && newComplaint.assigned_department === profile?.department) {
        toast('New Assignment', `New task assigned to your department: #${newComplaint.id.split('-')[0].toUpperCase()}`);
      }
    }

    // 2. Resolution Request (Target: Admin)
    if (newComplaint.status === 'Waiting Verification' && oldComplaint.status !== 'Waiting Verification') {
      if (role === 'admin' || role === 'super_admin') {
        toast('Verification Required', `Department marked resolution for #${newComplaint.id.split('-')[0].toUpperCase()}`);
      }
    }

    // 3. Status Updates (Target: Student who filed it)
    if (newComplaint.status !== oldComplaint.status) {
      if (user?.id === newComplaint.user_id) {
        toast('Complaint Update', `Status of your complaint #${newComplaint.id.split('-')[0].toUpperCase()} changed to ${newComplaint.status}`);
      }
    }

    // 4. Escalations (Target: Admin)
    if (newComplaint.status === 'Escalated' && oldComplaint.status !== 'Escalated') {
      if (role === 'admin' || role === 'super_admin') {
        toast('High Priority Escalation', `Complaint #${newComplaint.id.split('-')[0].toUpperCase()} has been escalated.`);
      }
    }
  };

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
