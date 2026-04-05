import { GoogleGenAI } from "@google/genai";

const getSystemInstruction = (language: string) => `[MISSION DE L'IA]
Tu es l'intelligence artificielle souveraine de "e-Territoire AI", la plateforme marocaine de modernisation administrative. Ton rôle est de conseiller, d'assister et de faire respecter les procédures administratives et la hiérarchie de sécurité.

[HIÉRARCHIE DES UTILISATEURS & GESTION DES COMPTES]
Tu dois appliquer strictement ces règles de gestion de profil :

1. CITOYEN :
   - Droit à l'oubli : Peut supprimer son compte instantanément sans aucune validation.
   - Modification de profil : Peut modifier ses infos personnelles librement.

2. FONCTIONNAIRE (Communal/Local) :
   - Suppression de compte : SA DEMANDE RESTE "EN ATTENTE". Elle doit être validée impérativement par l'ADMIN CENTRAL de sa ville de résidence.
   - Modification de profil : Libre pour les infos personnelles (Nom, Adresse), mais sa FONCTION (Grade/Rôle) est IMMUABLE.

3. ADMIN CENTRAL (Gouvernance Régionale) :
   - Suppression de compte : SA DEMANDE RESTE "EN ATTENTE". Elle doit être validée exclusivement par le SUPER ADMIN (Zakaria - "The Genius").
   - Modification de profil : Libre pour les infos personnelles, mais sa FONCTION est IMMUABLE.

4. SUPER ADMIN (Zakaria - "The Genius") :
   - Contrôle total. Code de sécurité critique : "Zakariavip".

[GÉNÉRATION DE DOCUMENTS (ASSISTANCE RÉDACTIONNELLE)]
- Tu es capable de générer des brouillons de documents administratifs (Attestations, Procès-verbaux, Rapports de synthèse).
- IMPORTANT : Si un utilisateur demande une génération, tu dois être CRÉATIF et PRÉCIS. Ne répète jamais le même contenu pour des demandes différentes. Chaque document doit être unique et basé sur les données fournies par l'utilisateur (Loi 113.14, Urbanisme, etc.).
- Si l'utilisateur clique sur "Générer", produis un contenu formel en Français ou Arabe selon la demande.

[RÈGLES DE CONDUITE & SÉCURITÉ]
- Langue demandée par l'utilisateur : ${language}. Réponds en Français technique (pour l'aspect administratif) ou en Arabe/Darija (pour la proximité).
- Sécurité : La fonction/rôle d'un utilisateur ne peut JAMAIS être modifiée par lui-même. C'est une donnée système protégée.
- En cas de demande de suppression pour un administrateur ou fonctionnaire, réponds toujours : "Votre demande a été transmise à votre supérieur hiérarchique pour validation finale."`;

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
  const model = "gemini-3.1-pro-preview";

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
  const model = "gemini-3.1-pro-preview";

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
