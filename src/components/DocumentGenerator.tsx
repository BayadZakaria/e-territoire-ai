import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileOutput, Download, CheckCircle2, Shield, QrCode, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateDocumentDraft } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { QRCodeSVG } from 'qrcode.react';
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
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
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
              <div id="pv-content" className="p-8 flex flex-col gap-6 bg-white relative">
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
                  <h4 className="text-lg font-black uppercase tracking-widest text-[var(--color-majorelle-dark)]">{docType.toUpperCase()}</h4>
                  <div className="h-0.5 w-16 bg-[var(--color-saffron)] mx-auto" />
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-700 markdown-body">
                  <ReactMarkdown>{generatedContent}</ReactMarkdown>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-end break-inside-avoid">
                  <div className="flex flex-col gap-2">
                    <div className="p-1 bg-white border border-slate-200 rounded">
                      <QRCodeSVG value={`https://e-territoire.ma/verify/${Date.now()}`} size={64} />
                    </div>
                    <span className="text-[6px] text-slate-400">Réf: {Date.now().toString().slice(-6)}</span>
                  </div>

                  <div className="text-center relative min-w-[200px]">
                    <p className="text-[10px] font-bold mb-1 text-slate-600">Signé électroniquement par :</p>
                    <p className="text-sm font-bold text-[var(--color-majorelle-dark)]">{user?.full_name || 'Fonctionnaire Autorisé'}</p>
                    <p className="text-[10px] text-slate-500 mb-6">{user?.grade || 'Administrateur'}</p>

                    {/* Signature Cursive */}
                    <div
                      className="text-3xl text-blue-800/80 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4"
                      style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", transform: "rotate(-5deg) translateX(-50%)" }}
                    >
                      {user?.full_name || 'Signature'}
                    </div>

                    {/* CSS Seal */}
                    <div className="absolute top-0 right-[-20px] w-16 h-16 border-4 border-double border-red-600/40 rounded-full flex items-center justify-center rotate-12 opacity-70 pointer-events-none">
                      <div className="text-[5px] text-red-600/70 font-bold uppercase text-center leading-tight">
                        Royaume du Maroc<br />
                        <span className="text-[8px]">★</span><br />
                        Approuvé
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] opacity-5 pointer-events-none">
                  <h1 className="text-8xl font-black text-[var(--color-majorelle)]">DRAFT</h1>
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
