import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "appTitle": "Random Chat",
      "startChat": "Start Chat",
      "waiting": "Waiting for a partner...",
      "chatWithAI": "Chat with AI while waiting",
      "sendMessage": "Send message",
      "typeMessage": "Type a message...",
      "aiAssist": "AI Assist",
      "endChat": "End Chat",
      "newChat": "New Chat",
      "partnerDisconnected": "Partner has left the chat",
      "backToLobby": "Back to Lobby",
      "connectionLost": "Connection lost. Reconnecting...",
      "aiSuggestion": "AI Suggestion",
      "acceptSuggestion": "Accept",
      "modifySuggestion": "Modify",
      "rejectSuggestion": "Reject",
      "enterPrompt": "Enter a prompt for AI assistance...",
      "generateSuggestion": "Generate Suggestion",
      "loading": "Loading...",
      "you": "You",
      "partner": "Partner",
      "ai": "AI",
      "language": "Language"
    }
  },
  hu: {
    translation: {
      "appTitle": "Random Chat",
      "startChat": "Chat indítása",
      "waiting": "Várakozás partnerre...",
      "chatWithAI": "Beszélgess az AI-val várakozás közben",
      "sendMessage": "Küldés",
      "typeMessage": "Írj egy üzenetet...",
      "aiAssist": "AI Segítség",
      "endChat": "Chat befejezése",
      "newChat": "Új Chat",
      "partnerDisconnected": "A partner elhagyta a beszélgetést",
      "backToLobby": "Vissza a lobbyba",
      "connectionLost": "Kapcsolat megszakadt. Újracsatlakozás...",
      "aiSuggestion": "AI Javaslat",
      "acceptSuggestion": "Elfogad",
      "modifySuggestion": "Módosít",
      "rejectSuggestion": "Elvet",
      "enterPrompt": "Írj egy utasítást az AI segítségért...",
      "generateSuggestion": "Javaslat készítése",
      "loading": "Betöltés...",
      "you": "Te",
      "partner": "Partner",
      "ai": "AI",
      "language": "Nyelv"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
