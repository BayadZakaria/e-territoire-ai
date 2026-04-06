import React, { useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Phone, Shield, Trash2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export const ProfilePage = ({ user, onUpdate }: { user: UserProfile, onUpdate: (user: UserProfile) => void }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    surname: user.surname || '',
    email: user.email || '',
    phone: user.phone || '',
    city: user.city || '',
    grade: user.grade || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isCitizen = user.role === 'citizen';
  const isSuperAdmin = user.role === 'super_admin';
  const isOfficialOrAdmin = user.role === 'fonctionnaire' || user.role === 'admin_central';

  const canEditAll = isCitizen || isSuperAdmin;
  const canEditBasic = isOfficialOrAdmin || canEditAll;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updates: any = {
        email: formData.email,
        phone: formData.phone,
      };

      if (canEditAll) {
        updates.name = formData.name;
        updates.surname = formData.surname;
        updates.city = formData.city;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
      onUpdate({ ...user, ...updates, full_name: updates.name ? `${updates.name} ${updates.surname}` : user.full_name });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isCitizen) {
        // Direct deletion
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
        if (profileError) throw profileError;
        
        // Note: In a real app, users can't delete themselves via admin API from client.
        // They would call an edge function or we just delete their profile and trigger cascade.
        // For now, we'll just delete the profile which cascades or marks as deleted.
        window.location.href = '/';
      } else {
        // Pending deletion for officials and admins
        const { error } = await supabase
          .from('profiles')
          .update({ status: 'pending_deletion' })
          .eq('id', user.id);

        if (error) throw error;

        setMessage({ 
          type: 'info', 
          text: `Votre demande de suppression est en cours de traitement par l'autorité compétente (${user.role === 'fonctionnaire' ? 'Admin de ' + user.city : 'Super Admin'}).`
        });
        onUpdate({ ...user, status: 'pending_deletion' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la demande de suppression.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-6", isRtl ? "flex-row-reverse" : "flex-row")}>
        <div className={cn("flex flex-col gap-2", isRtl ? "items-end" : "items-start")}>
          <h1 className="text-4xl font-black text-[var(--color-majorelle-dark)] font-tech">Mon Profil</h1>
          <p className="text-slate-600 font-medium">Gérez vos informations et paramètres de compte.</p>
        </div>
      </header>

      {user.status === 'pending_deletion' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
          <div>
            <h3 className="text-amber-800 font-bold text-lg">Demande de suppression en cours</h3>
            <p className="text-amber-700 mt-1">
              Votre demande de suppression est en cours de traitement par l'autorité compétente ({user.role === 'fonctionnaire' ? 'Admin de ' + user.city : 'Super Admin'}).
            </p>
          </div>
        </div>
      )}

      {message.text && (
        <div className={cn("p-4 rounded-xl flex items-center gap-3", 
          message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : 
          message.type === 'info' ? "bg-blue-50 text-blue-700 border border-blue-200" :
          "bg-red-50 text-red-700 border border-red-200"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[var(--color-majorelle)] to-[var(--color-majorelle-dark)] relative">
          <div className="absolute inset-0 zellij-pattern opacity-20" />
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-lg border border-slate-100">
              <div className="w-full h-full rounded-xl bg-[var(--color-majorelle)]/10 flex items-center justify-center">
                <User className="w-10 h-10 text-[var(--color-majorelle)]" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
              <Shield className="w-4 h-4 text-[var(--color-saffron)]" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t(user.role)}</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4" /> Prénom
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!canEditAll}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4" /> Nom
                </label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  disabled={!canEditAll}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!canEditBasic}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!canEditBasic}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Ville
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!canEditAll}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Grade / Fonction
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade || 'N/A'}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 outline-none opacity-80 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <button
                type="button"
                onClick={handleDeleteRequest}
                disabled={loading || user.status === 'pending_deletion'}
                className="w-full sm:w-auto px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                {isCitizen ? 'Supprimer mon compte' : 'Demander la suppression'}
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-[var(--color-majorelle)] text-white hover:bg-[var(--color-majorelle-dark)] rounded-xl font-bold transition-all shadow-lg shadow-[var(--color-majorelle)]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
