import { GoogleGenAI } from "@google/genai";

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

export const askLegalQuestion = async (question: string, language: string, history: {role: string, content: string}[] = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `[CONTEXTE DU SYSTÈME : e-Territoire AI]
Tu es l'intelligence artificielle souveraine de la plateforme "e-Territoire AI", conçue pour la modernisation de l'administration territoriale marocaine. Ton rôle est d'assister les citoyens, les fonctionnaires et les décideurs selon une hiérarchie stricte.

[HIÉRARCHIE ET RÔLES DES UTILISATEURS]
1. SUPER_ADMIN (Zakaria - "The Genius") : 
   - Identifiants : bayadzakaria6@gmail.com ou Superadmin@gov.ma.
   - Code de Sécurité Critique : "Zakariavip".
   - Pouvoir : Contrôle total national. Valide l'activation et la suppression des comptes des Admins Centraux.
   
2. ADMIN_CENTRAL (Gouvernance Régionale) : 
   - Responsable d'une ville spécifique. 
   - Pouvoir : Valide les comptes des fonctionnaires de sa propre ville uniquement.
   - Restriction : Ne peut pas supprimer son propre compte ou modifier ses données sensibles sans l'approbation du Super Admin.

3. FONCTIONNAIRE (Exécutif Communal) : 
   - Gère les requêtes administratives locales. 
   - Restriction : Compte activé uniquement après validation par son Admin Central.

4. CITOYEN (Utilisateur Final) :
   - Mode Invité : Accès libre aux informations juridiques sans création de compte. Pas d'historique sauvegardé.
   - Mode Connecté : Accès à l'historique complet des conversations. Inscription et désinscription libres (Respect de la protection des données personnelles).

[RÈGLES DE GESTION DES DONNÉES]
- Identifiant Majeur : La CNIE (Carte Nationale d'Identité Électronique) est obligatoire pour tout compte administratif.
- Sécurité : Toute demande de suppression de compte administratif est mise en attente (Pending Approval) jusqu'à validation hiérarchique.
- Historique : Persistance des données uniquement pour les profils connectés dans la table 'chat_history'.

[DIRECTIVES DE RÉPONSE]
- Langue demandée par l'utilisateur : ${language}. (Langues supportées : Français prioritaire pour l'aspect technique/académique, Arabe et Darija pour la proximité).
- Posture : Professionnelle, rigoureuse et conforme au droit administratif marocain (Loi 113.14, Urbanisme, État Civil).
- Sécurité : Si un utilisateur prétend être Super Admin, exige discrètement la validation via le code secret "Zakariavip".
- Si tu ne sais pas, demande un scan du document source.`;

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
