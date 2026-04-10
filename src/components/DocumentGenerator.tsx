import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileOutput, Download, CheckCircle2, Shield, QrCode, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateDocumentDraft } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import html2pdf from 'html2pdf.js';
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
    console.log('1. Initialisation du téléchargement PDF...');
    try {
      const element = document.getElementById('pv-content');
      if (!element) {
        alert("Erreur : L'élément #pv-content est introuvable sur la page !");
        console.error('Élément #pv-content introuvable.');
        return;
      }
      console.log('2. Élément #pv-content trouvé :', element);

      const opt = {
        margin: [15, 15, 15, 15] as [number, number, number, number],
        filename: `PV_${docType.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: true,
          onclone: (clonedDoc: Document) => {
            console.log('3. Clonage du DOM réussi, nettoyage des styles oklch...');
            // Suppression des styles globaux qui causent le crash oklch
            const styles = clonedDoc.querySelectorAll('head style, head link[rel="stylesheet"]');
            styles.forEach(s => s.remove());

            // Remplacement dynamique des couleurs oklch par HEX dans le DOM cloné
            const allElements = clonedDoc.getElementById('pv-content')?.getElementsByTagName('*');
            if (allElements) {
              for (let i = 0; i < allElements.length; i++) {
                const el = allElements[i] as HTMLElement;
                // Forcer les couleurs de base en HEX pour écraser tout héritage oklch
                if (el.style.color && el.style.color.includes('oklch')) el.style.color = '#000000';
                if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) el.style.backgroundColor = '#ffffff';
                if (el.style.borderColor && el.style.borderColor.includes('oklch')) el.style.borderColor = '#000000';

                // Sécurité supplémentaire pour les bordures
                if (!el.style.borderColor) el.style.borderColor = '#000000';
              }
            }
            console.log('4. Nettoyage du DOM cloné terminé.');
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      console.log('5. Lancement de html2pdf...');
      setTimeout(() => {
        try {
          html2pdf().set(opt).from(element).save().then(() => {
            console.log('6. PDF généré et téléchargé avec succès !');
          }).catch((err: any) => {
            console.error('Erreur lors de la génération html2pdf :', err);
            alert('Erreur lors de la génération du PDF. Consultez la console.');
          });
        } catch (err) {
          console.error('Erreur critique dans setTimeout html2pdf :', err);
        }
      }, 500);

    } catch (error) {
      console.error('Erreur globale dans downloadPDF :', error);
      alert('Une erreur inattendue est survenue lors de la préparation du PDF.');
    }
  };

  // Nettoyage du contenu généré par l'IA pour supprimer les dates/lieux fixes
  const cleanContent = generatedContent
    .replace(/Fait à .*, le .*/gi, '')
    .replace(/24 Mai 2024/gi, '');

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
              <div id="pv-content" style={{ backgroundColor: '#ffffff', color: '#000000', padding: '40px', position: 'relative', minHeight: '1050px', boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', fontFamily: 'Arial, sans-serif' } as React.CSSProperties}>
                <style>{`
                  #pv-content .markdown-body p {
                    margin-bottom: 15px;
                    line-height: 1.6;
                    font-size: 14px;
                    color: #000000;
                  }
                  #pv-content .markdown-body h1, 
                  #pv-content .markdown-body h2, 
                  #pv-content .markdown-body h3 {
                    color: #000000;
                    margin-bottom: 15px;
                    margin-top: 20px;
                    font-size: 16px;
                  }
                  #pv-content .markdown-body strong {
                    font-weight: bold;
                    color: #000000;
                  }
                `}</style>

                {/* Header Pro (Flexbox) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000000', paddingBottom: '15px', marginBottom: '30px' }}>
                  <div style={{ textAlign: 'left', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000000' }}>
                    <p style={{ margin: '2px 0' }}>Royaume du Maroc</p>
                    <p style={{ margin: '2px 0' }}>Ministère de l'Intérieur</p>
                  </div>
                  <div dir="rtl" style={{ textAlign: 'right', fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
                    <p style={{ margin: '2px 0' }}>المملكة المغربية</p>
                    <p style={{ margin: '2px 0' }}>وزارة الداخلية</p>
                  </div>
                </div>

                {/* Bloc Central */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000000', margin: '0' }}>
                    ATTESTATION ADMINISTRATIVE
                  </h4>
                </div>

                {/* Données Utilisateur */}
                <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #000000', backgroundColor: '#f9f9f9' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>
                    Monsieur : <span style={{ fontWeight: 'normal' }}>{user?.full_name?.toUpperCase() || 'ZAKARIA BAYAD'}</span>
                  </p>
                  <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>
                    CIN : <span style={{ fontWeight: 'normal' }}>{user?.cnie || 'BK9876'}</span>
                  </p>
                </div>

                {/* Content */}
                <div className="markdown-body" style={{ marginBottom: '200px' }}>
                  <ReactMarkdown>{cleanContent}</ReactMarkdown>
                </div>

                {/* Footer Fixe */}
                <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
                  {/* Date et Lieu Dynamiques */}
                  <div style={{ textAlign: 'right', marginBottom: '30px' }}>
                    <p style={{ fontSize: '14px', color: '#000000', margin: '0' }}>
                      Fait à Casablanca, le {new Date().toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {/* QR Code et Signature */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ padding: '4px', backgroundColor: '#ffffff', border: '1px solid #000000', width: 'fit-content' }}>
                        <QRCodeCanvas value="https://e-territoire-ai.vercel.app/" size={80} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', minWidth: '200px', position: 'relative' }}>
                      <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', margin: '0 0 40px 0' }}>L'Autorité Compétente</p>

                      {/* Signature Cursive */}
                      <div
                        style={{ fontSize: '24px', color: '#000000', fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", transform: 'rotate(-5deg) translateX(-50%)', position: 'absolute', bottom: '0', left: '50%', whiteSpace: 'nowrap' }}
                      >
                        {user?.full_name || 'Signature'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 z-[100] pointer-events-auto">
                <button
                  onClick={downloadPDF}
                  className="p-4 bg-[var(--color-majorelle)] text-white rounded-full shadow-2xl hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
                  title="Télécharger le PV (PDF)"
                  style={{ zIndex: 100 }}
                >
                  <Download className="w-6 h-6" />
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
