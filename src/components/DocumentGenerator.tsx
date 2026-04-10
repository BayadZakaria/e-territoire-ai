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
              <div id="pv-content" style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '20px', position: 'relative', minHeight: '1050px', boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', fontFamily: 'Arial, sans-serif' } as React.CSSProperties}>
                <style>{`
                  #pv-content .markdown-body p {
                    margin-bottom: 15px;
                    line-height: 1.6;
                    font-size: 14px;
                    color: #334155;
                  }
                  #pv-content .markdown-body h1, 
                  #pv-content .markdown-body h2, 
                  #pv-content .markdown-body h3 {
                    color: #1e3a8a;
                    margin-bottom: 15px;
                    margin-top: 20px;
                    font-size: 16px;
                  }
                  #pv-content .markdown-body strong {
                    font-weight: bold;
                    color: #0f172a;
                  }
                `}</style>

                {/* Official Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a', width: '30%' }}>
                    <p style={{ margin: '2px 0' }}>Royaume du Maroc</p>
                    <p style={{ margin: '2px 0' }}>Ministère de l'Intérieur</p>
                    <p style={{ margin: '2px 0' }}>Préfecture de Casablanca</p>
                  </div>
                  <div style={{ width: '50px', height: '50px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                    <Shield style={{ width: '24px', height: '24px', color: '#F4C430' }} />
                  </div>
                  <div dir="rtl" style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a', width: '30%' }}>
                    <p style={{ margin: '2px 0' }}>المملكة المغربية</p>
                    <p style={{ margin: '2px 0' }}>وزارة الداخلية</p>
                    <p style={{ margin: '2px 0' }}>عمالة الدار البيضاء</p>
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', color: '#1e3a8a', margin: '0 0 10px 0', letterSpacing: '1px' }}>{docType.toUpperCase()}</h4>
                  <div style={{ height: '2px', width: '60px', backgroundColor: '#F4C430', margin: '0 auto' }} />
                </div>

                {/* Encadré Certifie */}
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: '#0f172a', marginBottom: '20px', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                  CERTIFIE PAR LA PRÉSENTE QUE :
                </div>

                {/* Content */}
                <div className="markdown-body" style={{ marginBottom: '150px' }}>
                  <ReactMarkdown>{generatedContent}</ReactMarkdown>
                </div>

                {/* Footer (Absolute Bottom) */}
                <div style={{ position: 'absolute', bottom: '50px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '4px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', width: 'fit-content' }}>
                      <QRCodeCanvas value={`https://e-territoire.ma/verify/${Date.now()}`} size={70} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Réf: {Date.now().toString().slice(-6)}</span>
                  </div>

                  <div style={{ textAlign: 'center', position: 'relative', minWidth: '250px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', margin: '0 0 4px 0' }}>Fait le {new Date().toLocaleDateString('fr-FR')}</p>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', margin: '0 0 4px 0' }}>Signé électroniquement par :</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', margin: '0' }}>{user?.full_name || 'Fonctionnaire Autorisé'}</p>
                    <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 40px 0' }}>{user?.grade || 'Administrateur'}</p>

                    {/* Signature Cursive */}
                    <div
                      style={{ fontSize: '32px', color: '#1e40af', fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", transform: 'rotate(-5deg) translateX(-50%)', position: 'absolute', bottom: '0', left: '50%', whiteSpace: 'nowrap' }}
                    >
                      {user?.full_name || 'Signature'}
                    </div>

                    {/* CSS Seal */}
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '70px', height: '70px', border: '4px double #dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(12deg)', opacity: 0.7, pointerEvents: 'none' }}>
                      <div style={{ fontSize: '6px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', lineHeight: '1.2', color: '#dc2626' }}>
                        Royaume du Maroc<br />
                        <span style={{ fontSize: '10px' }}>★</span><br />
                        Approuvé
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', opacity: 0.03, pointerEvents: 'none' }}>
                  <h1 style={{ fontSize: '120px', fontWeight: '900', color: '#1e3a8a', margin: 0 }}>DRAFT</h1>
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
