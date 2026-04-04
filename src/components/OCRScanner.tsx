import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { analyzeDocument } from '../services/aiService';
import { cn } from '../lib/utils';

export const OCRScanner = ({ onDataExtracted }: { onDataExtracted: (data: any) => void }) => {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setScanning(true);
      setError(null);

      try {
        const result = await analyzeDocument(base64, "Extrait les informations du document.");
        onDataExtracted(result);
      } catch (err) {
        setError("Erreur lors de l'analyse du document.");
        console.error(err);
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-sm">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--color-majorelle)]/10 rounded-xl flex items-center justify-center border border-[var(--color-majorelle)]/20">
            <Camera className="text-[var(--color-majorelle)] w-6 h-6" />
          </div>
          <h3 className="text-[var(--color-majorelle-dark)] font-black text-xl font-tech">{t('scan_doc')}</h3>
        </div>
        {preview && (
          <button 
            onClick={() => { setPreview(null); setError(null); }}
            className="text-slate-400 hover:text-[var(--color-majorelle)] transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>

      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-all group"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="text-slate-400 w-8 h-8 group-hover:text-[var(--color-majorelle)] transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-slate-800 font-bold">Cliquez pour scanner ou glisser-déposer</p>
            <p className="text-slate-500 text-sm">PNG, JPG ou PDF (Max 5MB)</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      ) : (
        <div className="w-full relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
          <img src={preview} alt="Preview" className="w-full h-auto max-h-[400px] object-contain bg-slate-50" />
          
          {scanning && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--color-majorelle)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--color-majorelle)] font-bold animate-pulse">{t('extracting')}</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-50/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
              <AlertCircle className="text-red-500 w-12 h-12" />
              <p className="text-red-700 font-bold">{error}</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      )}

      <div className="w-full grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-[var(--color-saffron)] w-4 h-4" />
            <span className="text-slate-800 font-bold text-xs uppercase tracking-widest">Conformité</span>
          </div>
          <p className="text-slate-500 text-[10px]">Vérification automatique selon les normes de l'administration territoriale.</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="text-[var(--color-saffron)] w-4 h-4" />
            <span className="text-slate-800 font-bold text-xs uppercase tracking-widest">Indexation</span>
          </div>
          <p className="text-slate-500 text-[10px]">Indexation automatique dans Supabase pgvector pour le RAG hybride.</p>
        </div>
      </div>
    </div>
  );
};
