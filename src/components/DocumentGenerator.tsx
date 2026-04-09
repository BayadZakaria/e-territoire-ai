import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileOutput, Download, CheckCircle2, Shield, QrCode, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateDocumentDraft } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import { QRCodeCanvas } from 'qrcode.react';
import { UserProfile } from '../types';

export const DocumentGenerator = ({ user }: { user?: UserProfile }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [generating, setGenerating] = useState(false);
  const [docType, setDocType] = useState('Attestation Administrative');
  const [details, setDetails] = useState('');
  const [preview, setPreview] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleGenerate = async () => {
    if (!details.trim() && !docType) return;
    setGenerating(true);
    try {
      const content = await generateDocumentDraft(docType, details, i18n.language);
      setGeneratedContent(content || "Erreur lors de la génération.");
      setPreview(true);
    } catch (error) {
      console.error(error);
      setGeneratedContent("Une erreur est survenue lors de la génération du document.");
      setPreview(true);
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('pv-content');
    if (!element) return;

    const opt = {
      margin: [15, 15, 15, 15] as [number, number, number, number],
      filename: `PV_${docType.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    setTimeout(() => {
      html2pdf().set(opt).from(element).save();
    }, 500);
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
              <option value="Attestation Administrative">Attestation Administrative</option>
              <option value="Permis de Construire (Draft)">Permis de Construire (Draft)</option>
              <option value="Acte d'État Civil">Acte d'État Civil</option>
              <option value="Arrêté Municipal">Arrêté Municipal</option>
              <option value="Rapport de Synthèse">Rapport de Synthèse</option>
              <option value="Procès-verbal">Procès-verbal</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={cn("block text-xs font-bold text-slate-500 uppercase tracking-widest", isRtl ? "text-right" : "text-left")}>
              Informations Complémentaires
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--color-majorelle)] outline-none transition-all resize-none"
              placeholder="Détails spécifiques à inclure dans le document (ex: Nom, CIN, motif)..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !details.trim()}
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
            <div className="bg-white rounded-xl shadow-2xl text-slate-900 border border-slate-200 min-h-[400px] flex flex-col relative overflow-hidden">
              <div id="pv-content" className="p-8 flex flex-col gap-6 relative" style={{ backgroundColor: '#ffffff', color: '#0f172a', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}>
                {/* Official Header */}
                <div className="flex justify-between items-start pb-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <div className="text-[8px] font-bold uppercase tracking-tighter text-center" style={{ color: '#0f172a' }}>
                    <p>Royaume du Maroc</p>
                    <p>Ministère de l'Intérieur</p>
                    <p>Préfecture de Casablanca</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Shield className="w-6 h-6" style={{ color: '#F4C430' }} />
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-tighter text-center" dir="rtl" style={{ color: '#0f172a' }}>
                    <p>المملكة المغربية</p>
                    <p>وزارة الداخلية</p>
                    <p>عمالة الدار البيضاء</p>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-widest" style={{ color: '#1e3a8a' }}>{docType.toUpperCase()}</h4>
                  <div className="h-0.5 w-16 mx-auto" style={{ backgroundColor: '#F4C430' }} />
                </div>

                <div className="space-y-4 text-xs leading-relaxed markdown-body" style={{ color: '#334155' }}>
                  <ReactMarkdown>{generatedContent}</ReactMarkdown>
                </div>

                <div className="mt-12 pt-8 flex justify-between items-end break-inside-avoid" style={{ borderTop: '1px solid #e2e8f0' }}>
                  <div className="flex flex-col gap-2">
                    <div className="p-1 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                      <QRCodeCanvas value={`https://e-territoire.ma/verify/${Date.now()}`} size={64} />
                    </div>
                    <span className="text-[6px]" style={{ color: '#94a3b8' }}>Réf: {Date.now().toString().slice(-6)}</span>
                  </div>

                  <div className="text-center relative min-w-[200px]">
                    <p className="text-[10px] font-bold mb-1" style={{ color: '#475569' }}>Fait le {new Date().toLocaleDateString('fr-FR')}</p>
                    <p className="text-[10px] font-bold mb-1" style={{ color: '#475569' }}>Signé électroniquement par :</p>
                    <p className="text-sm font-bold" style={{ color: '#1e3a8a' }}>{user?.full_name || 'Fonctionnaire Autorisé'}</p>
                    <p className="text-[10px] mb-6" style={{ color: '#64748b' }}>{user?.grade || 'Administrateur'}</p>

                    {/* Signature Cursive */}
                    <div
                      className="text-3xl absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4"
                      style={{ color: '#1e40af', fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", transform: "rotate(-5deg) translateX(-50%)" }}
                    >
                      {user?.full_name || 'Signature'}
                    </div>

                    {/* CSS Seal */}
                    <div className="absolute top-0 right-[-20px] w-16 h-16 border-4 border-double rounded-full flex items-center justify-center rotate-12 pointer-events-none" style={{ borderColor: '#dc2626', opacity: 0.7 }}>
                      <div className="text-[5px] font-bold uppercase text-center leading-tight" style={{ color: '#dc2626' }}>
                        Royaume du Maroc<br />
                        <span className="text-[8px]">★</span><br />
                        Approuvé
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] pointer-events-none" style={{ opacity: 0.05 }}>
                  <h1 className="text-8xl font-black" style={{ color: '#6050DC' }}>DRAFT</h1>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 z-10">
                <button
                  onClick={downloadPDF}
                  className="p-3 bg-[var(--color-majorelle)] text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                  title="Télécharger le PV (PDF)"
                >
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
