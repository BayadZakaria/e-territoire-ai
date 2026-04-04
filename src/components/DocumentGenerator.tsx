import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileOutput, Download, CheckCircle2, Shield, QrCode, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export const DocumentGenerator = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [generating, setGenerating] = useState(false);
  const [docType, setDocType] = useState('attestation');
  const [preview, setPreview] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setPreview(true);
    }, 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col gap-8 shadow-sm">
      <div className={cn("flex items-center gap-4", isRtl ? "flex-row-reverse" : "flex-row")}>
        <div className="w-12 h-12 bg-[var(--color-majorelle)]/10 rounded-2xl flex items-center justify-center border border-[var(--color-majorelle)]/20">
          <FileOutput className="text-[var(--color-majorelle)] w-6 h-6" />
        </div>
        <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
          <h3 className="text-[var(--color-majorelle-dark)] font-black text-xl font-tech">{t('generate_doc')}</h3>
          <p className="text-slate-500 text-sm">Génération de drafts officiels avec préambule légal.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>
              Type de Document
            </label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all"
            >
              <option value="attestation">Attestation Administrative</option>
              <option value="permis">Permis de Construire (Draft)</option>
              <option value="acte">Acte d'État Civil</option>
              <option value="arrete">Arrêté Municipal</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>
              Informations Complémentaires
            </label>
            <textarea 
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all resize-none"
              placeholder="Détails spécifiques à inclure dans le document..."
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-4 bg-[var(--color-majorelle)] text-white rounded-xl font-bold hover:bg-[var(--color-majorelle-dark)] transition-all shadow-xl shadow-[var(--color-majorelle)]/20 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <FileOutput className="w-5 h-5" />
                Générer le Draft
              </>
            )}
          </button>
        </div>

        <div className="relative">
          {preview ? (
            <div className="bg-white rounded-xl p-8 shadow-2xl text-slate-900 border border-slate-200 min-h-[400px] flex flex-col gap-6 relative overflow-hidden">
              {/* Official Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div className="text-[8px] font-bold uppercase tracking-tighter text-center">
                  <p>Royaume du Maroc</p>
                  <p>Ministère de l'Intérieur</p>
                  <p>Préfecture de Casablanca</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
                  <Shield className="text-[var(--color-saffron)] w-6 h-6" />
                </div>
                <div className="text-[8px] font-bold uppercase tracking-tighter text-center" dir="rtl">
                  <p>المملكة المغربية</p>
                  <p>وزارة الداخلية</p>
                  <p>عمالة الدار البيضاء</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h4 className="text-lg font-black uppercase tracking-widest text-[var(--color-majorelle-dark)]">DRAFT OFFICIEL</h4>
                <div className="h-0.5 w-16 bg-[var(--color-saffron)] mx-auto" />
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <p className="font-bold italic text-slate-900">Vu le Dahir n° 1-15-85 du 20 ramadan 1436 (7 juillet 2015) portant promulgation de la loi organique n° 113-14 relative aux communes.</p>
                <p>Le Président du Conseil de la Commune de Casablanca, après examen du dossier n° 2026/04/001, certifie par la présente que les conditions requises sont remplies pour l'établissement de cet acte administratif.</p>
              </div>

              <div className="mt-auto flex justify-between items-end">
                <div className="flex flex-col gap-2">
                  <div className="w-16 h-16 bg-slate-50 rounded border border-slate-200 flex items-center justify-center">
                    <QrCode className="text-slate-400 w-10 h-10" />
                  </div>
                  <span className="text-[6px] text-slate-400">Vérification: e-Territoire.ma/verify/12345</span>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[8px] font-bold text-slate-600">Fait à Casablanca, le 04/04/2026</p>
                  <div className="w-24 h-12 border border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50">
                    <span className="text-[8px] text-slate-400 italic">Signature Digitale</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] opacity-5 pointer-events-none">
                <h1 className="text-8xl font-black text-[var(--color-majorelle)]">DRAFT</h1>
              </div>

              <div className="absolute bottom-4 right-4">
                <button className="p-3 bg-[var(--color-majorelle)] text-white rounded-full shadow-xl hover:scale-110 transition-transform">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full min-h-[400px] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-4 bg-slate-50">
              <FileText className="text-slate-300 w-16 h-16" />
              <p className="text-slate-500 text-sm font-medium">Aperçu du document généré</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
