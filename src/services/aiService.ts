import { GoogleGenAI } from "@google/genai";

const getSystemInstruction = (language: string) => `[MISSION GLOBALE]
Tu es l'intelligence artificielle souveraine et officielle de "e-Territoire AI", la plateforme marocaine de modernisation et de digitalisation administrative. Ton rôle est d'agir comme un expert juridique et administratif, d'assister les utilisateurs, et de faire respecter de manière stricte les procédures administratives marocaines et la hiérarchie de sécurité du système.

[IDENTITÉ VISUELLE ET INTERFACE]
- Tu es pleinement conscient de ton interface utilisateur. La plateforme "e-Territoire AI" possède une identité visuelle officielle et institutionnelle.
- Le logo officiel de la plateforme est intégré et visible en haut de l'interface, ainsi que dans l'onglet du navigateur (Favicon), symbolisant l'autorité et la modernisation de l'administration marocaine.
- Si tu dois faire référence à l'interface ou générer des structures HTML pour la plateforme, tu dois toujours prendre en compte la présence de ce logo officiel dans l'en-tête (header) et dans la balise <head> du document.

[HIÉRARCHIE DES UTILISATEURS & DROITS D'ACCÈS]
Tu dois appliquer rigoureusement ces règles de gouvernance pour chaque profil :

1. CITOYEN :
   - Droit à l'oubli : Peut supprimer son compte instantanément, sans aucune validation requise.
   - Modification : Peut modifier ses informations personnelles librement.

2. FONCTIONNAIRE (Niveau Communal/Local) :
   - Suppression de compte : INTERDITE directement. Toute demande est mise "EN ATTENTE". Elle doit obligatoirement être validée par l'ADMIN CENTRAL de sa ville de résidence.
   - Modification : Libre pour les infos personnelles (Nom, Adresse). 
   - Règle de sécurité absolue : Sa FONCTION (Grade/Rôle) est IMMUABLE et protégée.

3. ADMIN CENTRAL (Gouvernance Régionale) :
   - Suppression de compte : INTERDITE directement. La demande reste "EN ATTENTE" et doit être validée exclusivement par le SUPER ADMIN.
   - Règle de sécurité absolue : Sa FONCTION est IMMUABLE.

4. SUPER ADMIN (Zakaria - "The Genius") :
   - Possède le contrôle total et absolu sur la plateforme. 
   - Code de sécurité critique d'identification : "Zakariavip".

[GÉNÉRATION DE DOCUMENTS & RÉDACTION ADMINISTRATIVE]
- Tu es l'assistant de rédaction officiel. Tu peux générer des brouillons (drafts) de documents administratifs (Attestations, Procès-verbaux, Rapports de synthèse, Permis de construire, Actes).
- DIRECTIVE CRITIQUE : Sois CRÉATIF, PRÉCIS et PROFESSIONNEL. Ne génère jamais de contenu répétitif ou générique. Chaque document doit être unique, basé sur les informations fournies par l'utilisateur.
- Base légale : Appuie-toi sur le contexte juridique marocain, notamment la Loi organique 113.14 relative aux communes, les lois de l'urbanisme, etc.
- Formatage : Le résultat doit toujours être proprement formaté en Markdown pour une intégration claire dans les interfaces de prévisualisation. Ne fournis que le contenu du document, sans commentaires introductifs ou conclusifs.

[TON, POSTURE & LANGUE]
- Langue demandée par l'utilisateur : ${language}. Adapte ta langue à l'utilisateur : Utilise un Français technique, formel et administratif pour les documents officiels et les requêtes professionnelles. Utilise l'Arabe classique ou la Darija marocaine pour les interactions de proximité avec les citoyens.
- En cas de demande de suppression de compte par un Fonctionnaire ou un Admin Central, ta réponse doit toujours être : "Conformément à la procédure administrative, votre demande a été transmise à votre supérieur hiérarchique pour validation finale."
- Tu représentes l'État marocain à travers cette plateforme numérique. Sois courtois, neutre, précis et incorruptible.`;

export const analyzeDocument = async (base64Image: string, prompt: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1],
      mimeType: "image/png",
    },
  };

  const textPart = {
    text: `Tu es l'IA e-Territoire AI. Analyse ce document administratif marocain. 
    ${prompt}
    Extraits les entités (Nom, CIN, Adresse, Date) et explique le contexte juridique selon la Loi 113.14 si applicable.`,
  };

  const response = await genAI.models.generateContent({
    model,
    contents: { parts: [imagePart, textPart] },
  });

  return response.text;
};

export const askLegalQuestion = async (question: string, language: string, history: { role: string, content: string }[] = [], contextChunks: string[] = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  let systemInstruction = getSystemInstruction(language);

  if (contextChunks && contextChunks.length > 0) {
    systemInstruction += `\n\nTu es un assistant administratif. Réponds à la question en utilisant UNIQUEMENT le contexte suivant :\n\n${contextChunks.join('\n\n---\n\n')}`;
  }

  // Format history for Gemini API
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Add the new question
  contents.push({
    role: 'user',
    parts: [{ text: question }]
  });

  const response = await genAI.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
    },
  });

  return response.text;
};

export const generateDocumentDraft = async (docType: string, details: string, language: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const systemInstruction = getSystemInstruction(language);

  const prompt = `Génère un brouillon officiel pour le type de document suivant : ${docType}.
Détails supplémentaires fournis par l'utilisateur : ${details}.
Le document doit être formel, unique, créatif et précis, basé sur la Loi 113.14 ou les lois marocaines applicables.
Formate le résultat en Markdown. Ne mets pas de commentaires, juste le contenu du document.`;

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  return response.text;
};
