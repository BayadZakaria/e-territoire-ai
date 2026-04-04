import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Search, Send, Shield, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { askLegalQuestion } from '../services/aiService';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const LegalAssistant = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await askLegalQuestion(input, i18n.language, messages);
      const assistantMessage: Message = { role: 'assistant', content: response || "Je n'ai pas pu générer de réponse." };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = { role: 'assistant', content: `**Erreur :** ${err.message || "Une erreur est survenue lors de la consultation juridique."}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col gap-8 h-[600px] shadow-sm">
      <div className={cn("flex items-center gap-4", isRtl ? "flex-row-reverse" : "flex-row")}>
        <div className="w-12 h-12 bg-[var(--color-majorelle)]/10 rounded-2xl flex items-center justify-center border border-[var(--color-majorelle)]/20">
          <Globe className="text-[var(--color-majorelle)] w-6 h-6" />
        </div>
        <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
          <h3 className="text-[var(--color-majorelle-dark)] font-black text-xl font-tech">Assistant e-Territoire AI</h3>
          <p className="text-slate-500 text-sm">Expert en droit administratif marocain (Loi 113.14, Urbanisme, État Civil).</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-50">
            <MessageSquare className="w-16 h-16 text-[var(--color-majorelle)]" />
            <div className="space-y-1">
              <p className="text-slate-800 font-bold">Comment puis-je vous aider ?</p>
              <p className="text-slate-500 text-xs">Posez vos questions sur les procédures administratives.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i}
              className={cn(
                "flex flex-col gap-2 max-w-[85%]",
                msg.role === 'user' 
                  ? (isRtl ? "mr-auto items-start" : "ml-auto items-end") 
                  : (isRtl ? "ml-auto items-end" : "mr-auto items-start")
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-[var(--color-majorelle)] text-white shadow-md shadow-[var(--color-majorelle)]/20" 
                  : "bg-slate-50 border border-slate-200 text-slate-800"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {msg.role === 'user' ? 'Vous' : 'e-Territoire AI'}
              </span>
            </div>
          ))
        )}
        {loading && (
          <div className={cn("flex flex-col gap-2 max-w-[85%]", isRtl ? "ml-auto items-end" : "mr-auto items-start")}>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-[var(--color-majorelle)] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[var(--color-majorelle)] rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-[var(--color-majorelle)] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ex: Quelles sont les pièces pour un permis de construire ?"
          className={cn(
            "w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:border-[var(--color-majorelle)] transition-all pr-16",
            isRtl ? "text-right" : "text-left"
          )}
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 p-3 bg-[var(--color-majorelle)] text-white rounded-xl shadow-md hover:bg-[var(--color-majorelle-dark)] transition-all disabled:opacity-50",
            isRtl ? "left-2" : "right-2"
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 justify-center">
        <Shield className="text-[var(--color-saffron)] w-4 h-4" />
        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
          Réponses basées sur le Droit Administratif Marocain
        </span>
      </div>
    </div>
  );
};
