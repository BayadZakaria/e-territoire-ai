import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
// استدعاء مكتبة قراءة الـ PDF
import * as pdfjsLib from 'pdfjs-dist';

// ربط الـ Worker من CDN باش يخدم مزيان مع Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function UploadPDF() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    // 1. دالة تحويل النص لأرقام (Embeddings) عبر Gemini
    const generateEmbedding = async (text: string) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: { parts: [{ text: text }] }
            })
        });

        const data = await response.json();
        return data.embedding.values;
    };

    // 2. دالة تقطيع النص لفقرات (Chunking)
    const chunkText = (text: string, chunkSize: number = 400) => {
        const words = text.split(' ');
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) {
            chunks.push(words.slice(i, i + chunkSize).join(' '));
        }
        return chunks;
    };

    // 3. المحرك الرئيسي لرفع وقراءة الـ PDF
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setStatus('Lecture du PDF en cours... 📄');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + ' ';
            }

            setStatus('Découpage et analyse par IA (Embeddings)... 🧠');
            const chunks = chunkText(fullText, 400);

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                if (chunk.trim().length < 10) continue;

                const embedding = await generateEmbedding(chunk);

                const { error } = await supabase.from('document_chunks').insert({
                    document_name: file.name,
                    content: chunk,
                    embedding: embedding
                });

                if (error) console.error("Erreur d'insertion Supabase:", error);
            }

            setStatus('✅ Document mémorisé avec succès ! L\'IA est prête à répondre.');
        } catch (error) {
            console.error("Erreur générale:", error);
            setStatus('❌ Une erreur est survenue lors de la lecture du fichier.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-2 text-indigo-900">Alimenter l'IA (Système RAG) 📚</h2>
            <p className="text-sm text-gray-500 mb-4">Uploadez un document officiel (PDF) pour que l'IA puisse le lire et l'apprendre.</p>

            <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                disabled={loading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer transition-colors"
            />

            {status && (
                <div className={`mt-4 p-3 rounded-md font-medium text-sm border ${status.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                    {status}
                </div>
            )}
        </div>
    );
}