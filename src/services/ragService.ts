import * as pdfjsLib from 'pdfjs-dist';
// Assurez-vous d'avoir installé : npm install @google/generative-ai
import { GoogleGenAI } from '@google/generative-ai';
import { supabase } from '../supabase';
// Configuration du Worker PDF.js via CDN pour une compatibilité optimale avec Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extrait l'intégralité du texte à partir d'un fichier PDF
 * @param file Le fichier PDF uploadé par l'utilisateur
 * @returns Le texte brut contenu dans le document
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

/**
 * Découpe un texte volumineux en segments (chunks) plus petits
 * @param text Le texte complet à découper
 * @param chunkSize Le nombre de mots par segment (défaut: 500)
 * @returns Un tableau de segments de texte
 */
export const chunkText = (text: string, chunkSize: number = 500): string[] => {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }

  return chunks;
};

/**
 * Génère un vecteur numérique (Embedding) à partir d'un texte via l'API Gemini
 * @param text Le segment de texte à vectoriser
 * @returns Un tableau de nombres représentant le sens sémantique (768 dimensions)
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  // Récupération de la clé API depuis les variables d'environnement Vite
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY est manquante dans le fichier .env");

  const genAI = new GoogleGenAI(apiKey);
  // Utilisation du modèle stable text-embedding-004
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const result = await model.embedContent(text);
  const embedding = result.embedding;

  if (!embedding || !embedding.values) {
    throw new Error("Échec de la génération de l'embedding");
  }

  return embedding.values;
};

/**
 * Pipeline complet : Extraction, Segmentation, Vectorisation et Stockage dans Supabase
 * @param file Le document PDF à traiter
 */
export const processAndStorePDF = async (file: File) => {
  try {
    // 1. Extraction du texte brut
    const text = await extractTextFromPDF(file);

    // 2. Segmentation en blocs de 400 mots pour une meilleure précision de recherche
    const chunks = chunkText(text, 400);

    // 3. Transformation et stockage de chaque segment dans la base de données vectorielle
    for (const chunk of chunks) {
      if (!chunk.trim() || chunk.length < 10) continue;

      const embedding = await generateEmbedding(chunk);

      const { error } = await supabase
        .from('document_chunks')
        .insert({
          document_name: file.name,
          content: chunk,
          embedding: embedding
        });

      if (error) {
        console.error("Erreur d'insertion dans Supabase:", error);
        throw error;
      }
    }

    return { success: true, chunksProcessed: chunks.length };
  } catch (error) {
    console.error("Erreur lors du traitement du PDF:", error);
    throw error;
  }
};

/**
 * Recherche sémantique des segments les plus pertinents par rapport à une requête
 * @param query La question de l'utilisateur
 * @param matchCount Le nombre de segments à retourner (défaut: 3)
 * @returns Liste des segments correspondants avec leur score de similarité
 */
export const searchRelevantDocuments = async (query: string, matchCount: number = 3) => {
  try {
    // 1. Vectorisation de la requête utilisateur
    const queryEmbedding = await generateEmbedding(query);

    // 2. Appel de la fonction RPC 'match_documents' sur Supabase (Similarité Cosinus)
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // Seuil de pertinence (0.5 pour commencer)
      match_count: matchCount
    });

    if (error) {
      console.error("Erreur lors de la recherche vectorielle:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erreur dans searchRelevantDocuments:", error);
    return [];
  }
};