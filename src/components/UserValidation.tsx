import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, User, MapPin, Briefcase, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../supabase';

export const UserValidation = ({ currentUser }: { currentUser: UserProfile }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError('');
    
    if (!isSupabaseConfigured()) {
      setPendingUsers([]);
      setLoading(false);
      return;
    }

    try {
      // The RLS policies automatically filter what the user can see.
      // We just need to query for users who are not approved.
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_approved', false);

      if (fetchError) throw fetchError;
      setPendingUsers(data as UserProfile[]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, [currentUser]);

  const handleApprove = async (userId: string) => {
    if (!isSupabaseConfigured()) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);

      if (updateError) throw updateError;
      
      // Email Notification Explanation:
      // To trigger an email notification upon approval, you can:
      // 1. Create a Supabase Edge Function that listens to database webhooks (UPDATE on public.profiles where is_approved changes to true).
      // 2. The Edge Function can use a service like Resend or SendGrid to send an email to the user's email address (fetched from auth.users).
      // 3. Alternatively, you can call an API endpoint directly from this React component after a successful update, passing the user ID to trigger the email.
      console.log(`User ${userId} approved. Trigger email notification here.`);

      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert('Erreur lors de la validation: ' + err.message);
    }
  };

  const handleReject = async (userId: string) => {
    if (!isSupabaseConfigured()) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      return;
    }

    try {
      // In a real app, you might want to delete the profile or mark it as rejected.
      // For now, we'll just remove it from the list.
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert('Erreur lors du rejet: ' + err.message);
    }
  };

  if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin_central') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className={cn("flex items-center justify-between mb-8", isRtl ? "flex-row-reverse" : "flex-row")}>
        <div className={cn("flex items-center gap-3", isRtl ? "flex-row-reverse" : "flex-row")}>
          <div className="bg-[var(--color-majorelle)]/10 p-3 rounded-xl border border-[var(--color-majorelle)]/20">
            <Shield className="w-6 h-6 text-[var(--color-majorelle)]" />
          </div>
          <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
            <h2 className="text-2xl font-black text-[var(--color-majorelle-dark)] font-tech">Validation des Comptes</h2>
            <p className="text-slate-500 text-sm">
              {currentUser.role === 'super_admin' 
                ? "Gestion de tous les comptes en attente" 
                : `Gestion des Fonctionnaires - ${currentUser.city}`}
            </p>
          </div>
        </div>
        <button 
          onClick={fetchPendingUsers}
          disabled={loading}
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {!isSupabaseConfigured() && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
          Mode Démo : Supabase n'est pas configuré.
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <RefreshCw className="w-10 h-10 text-[var(--color-majorelle)]/50 mb-4 animate-spin" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 font-tech">Chargement...</h3>
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <CheckCircle className="w-16 h-16 text-emerald-500/50 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 font-tech">Aucune demande en attente</h3>
          <p className="text-slate-500">Tous les comptes ont été traités.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((user) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={cn("flex items-start gap-4", isRtl ? "flex-row-reverse" : "flex-row")}>
                <div className="w-12 h-12 bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
                  <div className={cn("flex items-center gap-2 mb-1", isRtl ? "flex-row-reverse" : "flex-row")}>
                    <h3 className="text-lg font-bold text-slate-800">{user.full_name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-majorelle)]/10 text-[var(--color-majorelle)] text-xs font-bold uppercase tracking-wider">
                      {t(user.role)}
                    </span>
                  </div>
                  <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-3", isRtl ? "text-right" : "text-left")}>
                    <div className={cn("flex items-center gap-2 text-slate-500 text-sm", isRtl ? "flex-row-reverse" : "flex-row")}>
                      <MapPin className="w-4 h-4" />
                      <span className="capitalize">{user.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn("flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0", isRtl ? "flex-row-reverse" : "flex-row")}>
                <button 
                  onClick={() => handleReject(user.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-colors border border-red-100"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Rejeter</span>
                </button>
                <button 
                  onClick={() => handleApprove(user.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold transition-colors border border-emerald-100"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Valider</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

