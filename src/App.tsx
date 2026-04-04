import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Globe, User, LogOut, LayoutDashboard, 
  FileText, Shield, Map, Building2, Search, Bell,
  Camera, FileSearch, FileOutput, CheckCircle2, Clock, QrCode, Activity
} from 'lucide-react';
import { cn } from './lib/utils';
import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, UserRole } from './types';
import { OCRScanner } from './components/OCRScanner';
import { DocumentGenerator } from './components/DocumentGenerator';
import { LegalAssistant } from './components/LegalAssistant';
import { UserValidation } from './components/UserValidation';
import { MoroccoMap } from './components/MoroccoMap';

// --- Components ---

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
    { code: 'tz', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' },
    { code: 'da', name: 'Darija' }
  ];

  return (
    <div className="flex gap-2 p-1.5 bg-white/50 rounded-lg backdrop-blur-sm border border-white/40 shadow-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={cn(
            "px-3 py-1 text-xs font-bold rounded transition-all",
            i18n.language === lang.code 
              ? "bg-[var(--color-majorelle)] text-white shadow-md" 
              : "text-slate-600 hover:text-[var(--color-majorelle)] hover:bg-white/50"
          )}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

const Navbar = ({ user, onLogout }: { user: UserProfile | null, onLogout: () => void }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between transition-all shadow-sm",
      isRtl ? "flex-row-reverse" : "flex-row"
    )}>
      <Link to="/" className={cn("flex items-center gap-3 hover:opacity-80 transition-opacity", isRtl ? "flex-row-reverse" : "flex-row")}>
        <div className="w-10 h-10 bg-[var(--color-moroccan-red)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--color-moroccan-red)]/20 border border-white/50 relative overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-8 h-8 text-[var(--color-moroccan-green)] absolute opacity-20">
            <polygon points="50,5 61,39 97,39 68,60 79,95 50,74 21,95 32,60 3,39 39,39" fill="none" stroke="currentColor" strokeWidth="4"/>
          </svg>
          <Shield className="text-[var(--color-saffron)] w-6 h-6 relative z-10" />
        </div>
        <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
          <span className="text-[var(--color-moroccan-green)] font-black text-xl tracking-tight font-tech">e-Territoire AI</span>
          <span className="text-[var(--color-moroccan-red)] text-[10px] font-bold uppercase tracking-widest leading-none">Gouvernance Numérique</span>
        </div>
      </Link>

      <div className={cn("flex items-center gap-6", isRtl ? "flex-row-reverse" : "flex-row")}>
        {/* HUD Widget */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-glow"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-tech">IA Connectée</span>
        </div>

        <LanguageSwitcher />
        {user ? (
          <div className={cn("flex items-center gap-4", isRtl ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
              <span className="text-slate-800 text-sm font-bold">{user.name} {user.surname}</span>
              <span className="text-[var(--color-majorelle)] text-[10px] uppercase font-black">{t(user.role)}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="px-6 py-2 bg-[var(--color-majorelle)] text-white rounded-full text-sm font-bold hover:bg-[var(--color-majorelle-dark)] transition-all shadow-lg shadow-[var(--color-majorelle)]/20 border border-white/10"
          >
            {t('login')}
          </Link>
        )}
      </div>
    </nav>
  );
};

// --- Pages ---

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-[var(--color-alabaster)] pt-24 px-6 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-majorelle)]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-moroccan-green)]/10 blur-[120px] rounded-full" />
      <div className="absolute inset-0 zellij-pattern opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn("flex flex-col gap-8", isRtl ? "text-right" : "text-left")}
        >
          <div className={cn("flex flex-col gap-4", isRtl ? "items-end" : "items-start")}>
            <span className="px-4 py-1.5 bg-[var(--color-moroccan-red)]/10 border border-[var(--color-moroccan-red)]/20 text-[var(--color-moroccan-red)] text-xs font-bold rounded-full uppercase tracking-widest flex items-center gap-2">
              <span className="text-[10px]">★</span> {t('official_header')}
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-[var(--color-majorelle-dark)] leading-[1.1] font-tech">
              {t('welcome')}
            </h1>
            <p className="text-slate-600 text-lg max-w-xl leading-relaxed">
              La plateforme intelligente de gestion territoriale marocaine. Digitalisation, transparence et efficacité au service du citoyen et de l'administration.
            </p>
          </div>

          <div className={cn("flex flex-wrap gap-4", isRtl ? "justify-end" : "justify-start")}>
            <Link to="/register" className="px-8 py-4 bg-[var(--color-majorelle)] text-white rounded-2xl font-bold hover:bg-[var(--color-majorelle-dark)] transition-all shadow-xl shadow-[var(--color-majorelle)]/20 flex items-center gap-3">
              {t('register')}
              <User className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white text-[var(--color-majorelle)] border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm">
              {t('login')}
              <LayoutDashboard className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
            {[
              { icon: FileSearch, label: "Hybrid RAG", value: "Lois & Décrets" },
              { icon: Camera, label: "OCR AI", value: "Extraction NER" },
              { icon: FileOutput, label: "Génération", value: "Actes Officiels" }
            ].map((stat, i) => (
              <div key={i} className={cn("flex flex-col gap-1", isRtl ? "items-end" : "items-start")}>
                <stat.icon className="w-6 h-6 text-[var(--color-moroccan-green)] mb-2" />
                <span className="text-slate-800 font-black text-sm font-tech">{stat.value}</span>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="aspect-square bg-gradient-to-br from-[var(--color-majorelle)]/5 to-[var(--color-moroccan-green)]/5 moorish-arch border border-[var(--color-majorelle)]/10 p-8 relative overflow-hidden group">
            
            {/* Mock Dashboard UI */}
            <div className="relative z-10 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-2xl transform group-hover:rotate-1 transition-transform duration-700 mt-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-moroccan-red)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--color-saffron)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--color-moroccan-green)]" />
                </div>
                <div className="px-3 py-1 bg-[var(--color-moroccan-green)]/10 border border-[var(--color-moroccan-green)]/20 rounded text-[10px] text-[var(--color-moroccan-green)] font-bold uppercase flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-moroccan-green)] animate-pulse" />
                  Live: Tanger-Tétouan-Al Hoceïma
                </div>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-4 gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-majorelle)]/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[var(--color-majorelle)]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-2 w-24 bg-slate-200 rounded" />
                      <div className="h-1.5 w-16 bg-slate-100 rounded" />
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--color-saffron)]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-20 right-10 bg-[var(--color-moroccan-green)] p-4 rounded-2xl shadow-2xl z-20"
            >
              <CheckCircle2 className="text-white w-8 h-8" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-10 left-10 bg-white p-4 rounded-2xl shadow-2xl z-20 border border-slate-200"
            >
              <Clock className="text-[var(--color-saffron)] w-8 h-8" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (user: UserProfile) => void }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const validEmails = ['bayadzakaria6@gmail.com', 'superadmin@gov.ma'];
    const isHardcodedAdmin = validEmails.includes(cleanEmail) && cleanPassword === 'Zakariavip';

    if (!isSupabaseConfigured()) {
      // Fallback to mock login if Supabase is not configured
      setTimeout(() => {
        if (isHardcodedAdmin) {
          onLogin({
            id: '1',
            name: 'Zakaria',
            surname: 'Bayad',
            email: cleanEmail,
            phone: '0600000000',
            role: 'super_admin',
            city: 'Rabat',
            is_approved: true,
            status: 'active',
            created_at: new Date().toISOString()
          });
        } else {
          setError('Identifiants ou mot de passe incorrects. Accès refusé.');
        }
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError) {
        if (isHardcodedAdmin) {
          throw new Error("Vos clés Supabase sont configurées, mais vous devez d'abord créer ce compte dans l'onglet 'Authentication' de Supabase !");
        }
        throw authError;
      }

      if (authData.user) {
        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile.status === 'pending') {
          throw new Error('Votre compte est en attente de validation par un administrateur.');
        }

        onLogin(profile as UserProfile);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-alabaster)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-30 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className={cn("flex flex-col gap-2 mb-8", isRtl ? "items-end" : "items-start")}>
          <h2 className="text-3xl font-black text-[var(--color-majorelle-dark)] font-tech">{t('login')}</h2>
          <p className="text-slate-500 text-sm">Accédez à votre espace sécurisé.</p>
        </div>

        {!isSupabaseConfigured() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
            Mode Démo : Supabase n'est pas configuré. La connexion est simulée (Super-Admin).
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>
              {t('email')}
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all"
              placeholder="votre@email.ma"
            />
          </div>
          <div className="space-y-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>
              Mot de passe
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-4 bg-[var(--color-majorelle)] text-white rounded-xl font-bold hover:bg-[var(--color-majorelle-dark)] transition-all shadow-xl shadow-[var(--color-majorelle)]/20 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : t('login')}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-[var(--color-majorelle)] font-bold hover:underline">
              {t('register')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const RegisterPage = ({ onRegister }: { onRegister: (user: UserProfile) => void }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [role, setRole] = useState<UserRole>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
    cnie: '',
    grade: '',
    matricule: '',
    city: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!isSupabaseConfigured()) {
      // Fallback to mock registration
      setTimeout(() => {
        onRegister({
          id: Math.random().toString(36).substr(2, 9),
          email: formData.email,
          name: formData.name,
          surname: formData.surname,
          phone: formData.phone,
          cnie: role !== 'citizen' ? formData.cnie : undefined,
          city: formData.city,
          role,
          is_approved: role === 'citizen',
          status: role === 'citizen' ? 'active' : 'pending',
          created_at: new Date().toISOString()
        });
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            surname: formData.surname,
            phone: formData.phone,
            cnie: role !== 'citizen' ? formData.cnie : null,
            grade: (role === 'official' || role === 'admin_central') ? formData.grade : null,
            matricule: (role === 'official' || role === 'admin_central') ? formData.matricule : null,
            city: formData.city,
            role: role
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        setSuccess('Inscription réussie ! Veuillez vérifier votre email.');
        if (authData.session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
          
          if (profile) {
            if (profile.status === 'pending') {
              setError('Votre compte a été créé et est en attente de validation par un administrateur.');
            } else {
              onRegister(profile as UserProfile);
            }
          }
        } else {
          setSuccess('Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-alabaster)] flex items-center justify-center p-6 pt-24 relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-30 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className={cn("flex flex-col gap-2 mb-8", isRtl ? "items-end" : "items-start")}>
          <h2 className="text-3xl font-black text-[var(--color-majorelle-dark)] font-tech">{t('register')}</h2>
          <p className="text-slate-500 text-sm">Rejoignez l'administration territoriale numérique souveraine.</p>
        </div>

        {!isSupabaseConfigured() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
            Mode Démo : Supabase n'est pas configuré. L'inscription est simulée.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm">
            {success}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          {(['citizen', 'official', 'admin_central', 'super_admin'] as UserRole[]).map((r) => (
            <button 
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-xs transition-all min-w-[100px]",
                role === r ? "bg-[var(--color-majorelle)] text-white shadow-md" : "text-slate-500 hover:text-[var(--color-majorelle)]"
              )}
            >
              {t(r)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>{t('name')}</label>
            <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>{t('surname')}</label>
            <input name="surname" value={formData.surname} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>{t('email')}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>{t('password')}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>{t('phone')}</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all" />
          </div>
          
          {role !== 'citizen' && (
            <div className="space-y-2 md:col-span-2">
              <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>CNIE (Obligatoire)</label>
              <input type="text" name="cnie" value={formData.cnie} onChange={handleChange} required placeholder="Ex: AB123456" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all" />
            </div>
          )}
          
          {(role === 'official' || role === 'admin_central') && (
            <>
              <div className="space-y-2">
                <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>{t('grade')}</label>
                <input name="grade" value={formData.grade} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>{t('matricule')}</label>
                <input name="matricule" value={formData.matricule} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all" />
              </div>
            </>
          )}

          <div className="space-y-2 md:col-span-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>{t('city')}</label>
            <select name="city" value={formData.city} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all">
              <option value="">Sélectionnez votre ville</option>
              <option value="casablanca">Casablanca</option>
              <option value="rabat">Rabat</option>
              <option value="tanger">Tanger</option>
              <option value="marrakech">Marrakech</option>
              <option value="fes">Fès</option>
            </select>
          </div>

          <button disabled={loading} className="md:col-span-2 py-4 bg-[var(--color-majorelle)] text-white rounded-xl font-bold hover:bg-[var(--color-majorelle-dark)] transition-all shadow-xl shadow-[var(--color-majorelle)]/20 mt-4 disabled:opacity-50">
            {loading ? 'Inscription...' : t('submit')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user }: { user: UserProfile }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<'overview' | 'scan' | 'generate' | 'legal' | 'validate'>('overview');

  // RBAC Tab Logic
  const getTabs = () => {
    const baseTabs = [
      { id: 'overview', label: t('dashboard'), icon: LayoutDashboard },
      { id: 'legal', label: t('legal_vulgarization'), icon: Search }
    ];

    if (user.role === 'official' || user.role === 'admin_central' || user.role === 'super_admin') {
      baseTabs.splice(1, 0, { id: 'scan', label: t('scan_doc'), icon: Camera });
      baseTabs.splice(2, 0, { id: 'generate', label: t('generate_doc'), icon: FileOutput });
    }

    if (user.role === 'admin_central' || user.role === 'super_admin') {
      baseTabs.push({ id: 'validate', label: t('validate_users'), icon: Shield });
    }

    return baseTabs;
  };

  const tabs = getTabs();

  const getOverviewCards = () => {
    if (user.role === 'super_admin') {
      return [
        { title: t('national_stats'), icon: Globe, color: "bg-[var(--color-majorelle)]", desc: "Vue panoramique du Maroc.", value: "12 Régions" },
        { title: t('validate_users'), icon: Shield, color: "bg-emerald-600", desc: "Validation des nouvelles administrations.", value: "En attente" },
        { title: "Mise à jour Lois", icon: FileText, color: "bg-[var(--color-copper)]", desc: "Base RAG Nationale.", value: "Active" }
      ];
    }
    if (user.role === 'admin_central') {
      return [
        { title: t('validate_users'), icon: Shield, color: "bg-emerald-600", desc: `Validation des fonctionnaires de ${user.city}.`, value: "En attente" },
        { title: "Statistiques Locales", icon: LayoutDashboard, color: "bg-[var(--color-majorelle)]", desc: `Activité de la commune de ${user.city}.`, value: "Active" }
      ];
    }
    if (user.role === 'official') {
      return [
        { title: t('procedures'), icon: FileText, color: "bg-[var(--color-majorelle)]", desc: "Suivi des dossiers et formalités.", value: "14 Dossiers" },
        { title: t('urbanism'), icon: Building2, color: "bg-emerald-600", desc: "Autorisations et plans d'aménagement.", value: "3 En cours" },
        { title: t('civil_status'), icon: User, color: "bg-[var(--color-copper)]", desc: "Actes de naissance et documents officiels.", value: "Opérationnel" }
      ];
    }
    return [
      { title: t('my_dossiers'), icon: FileText, color: "bg-[var(--color-majorelle)]", desc: "Suivi de vos demandes.", value: "2 Dossiers" },
      { title: t('procedures'), icon: Globe, color: "bg-emerald-600", desc: "Démarches administratives.", value: "Disponibles" }
    ];
  };

  return (
    <div className="min-h-screen bg-[var(--color-alabaster)] pt-20 flex">
      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed top-20 bottom-0 w-64 glass z-40 flex flex-col zellij-pattern",
        isRtl ? "right-0 border-l" : "left-0 border-r"
      )}>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3",
                  activeTab === tab.id 
                    ? "bg-[var(--color-majorelle)] text-white shadow-lg shadow-[var(--color-majorelle)]/20" 
                    : "text-slate-600 hover:text-[var(--color-majorelle)] hover:bg-[var(--color-majorelle)]/5",
                  isRtl ? "flex-row-reverse" : "flex-row"
                )}
              >
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-[var(--color-saffron)]" : "opacity-70")} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* User Mini Profile in Sidebar */}
        <div className="p-6 border-t border-slate-200 bg-white/50 backdrop-blur-md">
          <div className={cn("flex items-center gap-3", isRtl ? "flex-row-reverse" : "flex-row")}>
            <div className="w-10 h-10 rounded-full bg-[var(--color-majorelle)]/10 flex items-center justify-center border border-[var(--color-majorelle)]/20">
              <User className="w-5 h-5 text-[var(--color-majorelle)]" />
            </div>
            <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
              <span className="text-slate-800 font-bold text-sm">{user.name}</span>
              <span className="text-slate-500 text-xs">{user.id.padStart(8, '0')}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 p-6 md:p-10 transition-all",
        isRtl ? "mr-64" : "ml-64"
      )}>
        <div className="max-w-6xl mx-auto space-y-8">
          <header className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-6", isRtl ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("flex flex-col gap-2", isRtl ? "items-end" : "items-start")}>
              <h1 className="text-4xl font-black text-[var(--color-majorelle-dark)] font-tech">{t('dashboard')}</h1>
              <p className="text-slate-600 font-medium">Bienvenue, {user.name}. Espace <span className="text-[var(--color-majorelle)] font-bold">{t(user.role)}</span> de {user.city}.</p>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-3 gap-6"
              >
                {/* Dynamic Overview Cards based on Role */}
                {getOverviewCards().map((card, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-[var(--color-majorelle)]/50 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <div className={cn("flex items-center justify-between mb-4", isRtl ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", card.color)}>
                        <card.icon className="text-white w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-slate-800 font-tech">{card.value}</span>
                    </div>
                    <h3 className={cn("text-slate-800 font-bold text-lg", isRtl ? "text-right" : "text-left")}>{card.title}</h3>
                    <p className={cn("text-slate-500 text-sm mt-1", isRtl ? "text-right" : "text-left")}>{card.desc}</p>
                    
                    {/* Micro-Chart Placeholder */}
                    <div className="mt-4 h-8 flex items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      {[40, 70, 45, 90, 65, 85, 60].map((h, idx) => (
                        <div key={idx} className="flex-1 bg-[var(--color-majorelle)]/20 rounded-t-sm" style={{ height: `${h}%` }}>
                          <div className="w-full bg-[var(--color-majorelle)] rounded-t-sm transition-all duration-500" style={{ height: `${h * 0.8}%` }}></div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {/* 3D Map Section (Central) */}
                <div className="md:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                  <div className={cn("flex justify-between items-center mb-6", isRtl ? "flex-row-reverse" : "flex-row")}>
                    <h3 className="text-xl font-bold text-[var(--color-majorelle-dark)] font-tech">Réseau Territorial Souverain</h3>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase">Flux Actif</span>
                    </div>
                  </div>
                  <MoroccoMap activeCity={user.city} />
                </div>
                
                {/* Pending Validations Preview (if Admin) */}
                {(user.role === 'super_admin' || user.role === 'admin_central') && (
                  <div className="md:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className={cn("flex justify-between items-center mb-6", isRtl ? "flex-row-reverse" : "flex-row")}>
                      <h3 className="text-xl font-bold text-[var(--color-majorelle-dark)] font-tech">Validations en Attente</h3>
                      <button 
                        onClick={() => setActiveTab('validate')}
                        className="text-sm font-bold text-[var(--color-majorelle)] hover:underline"
                      >
                        Voir tout
                      </button>
                    </div>
                    <UserValidation currentUser={user} />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'scan' && (
              <motion.div 
                key="scan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto"
              >
                <OCRScanner onDataExtracted={(data) => console.log(data)} />
              </motion.div>
            )}

            {activeTab === 'generate' && (
              <motion.div 
                key="generate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DocumentGenerator />
              </motion.div>
            )}

            {activeTab === 'legal' && (
              <motion.div 
                key="legal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LegalAssistant />
              </motion.div>
            )}

            {activeTab === 'validate' && (
              <motion.div 
                key="validate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <UserValidation currentUser={user} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data && data.status === 'active') {
        setUser(data as UserProfile);
      } else {
        // If pending or rejected, log them out
        await supabase.auth.signOut();
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: UserProfile) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-alabaster)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-majorelle)]"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className={cn("min-h-screen font-sans selection:bg-[var(--color-majorelle)]/20", isRtl ? "font-arabic" : "")}>
        <Navbar user={user} onLogout={handleLogout} />
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={handleLogin} />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </AnimatePresence>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-[var(--color-moroccan-red)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--color-moroccan-red)]/20 border border-white/50 relative overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-6 h-6 text-[var(--color-moroccan-green)] absolute opacity-20">
                  <polygon points="50,5 61,39 97,39 68,60 79,95 50,74 21,95 32,60 3,39 39,39" fill="none" stroke="currentColor" strokeWidth="4"/>
                </svg>
                <Shield className="text-[var(--color-saffron)] w-4 h-4 relative z-10" />
              </div>
              <span className="text-[var(--color-moroccan-green)] font-black font-tech">e-Territoire AI</span>
            </Link>
            <div className="flex gap-8 text-slate-500 text-sm font-bold">
              <a href="#" className="hover:text-[var(--color-majorelle)] transition-all">Loi 113.14</a>
              <a href="#" className="hover:text-[var(--color-majorelle)] transition-all">Urbanisme</a>
              <a href="#" className="hover:text-[var(--color-majorelle)] transition-all">Confidentialité</a>
              <a href="#" className="hover:text-[var(--color-majorelle)] transition-all">Contact</a>
            </div>
            <p className="text-slate-400 text-xs font-bold">© 2026 Royaume du Maroc - Gouvernance Numérique</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
