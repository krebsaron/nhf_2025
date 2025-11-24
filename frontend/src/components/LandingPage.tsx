import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sessionApi } from '../services/api';
import { useChat } from '../context/ChatContext';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { setSessionId } = useChat();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const response = await sessionApi.createSession();
      setSessionId(response.sessionId);
      
      // Wait a bit to ensure WebSocket connection is established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await sessionApi.joinLobby(response.sessionId);
      
      navigate(`/lobby/${response.sessionId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="landing-page">
      <div className="language-selector">
        <button onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'active' : ''}>
          EN
        </button>
        <button onClick={() => changeLanguage('hu')} className={i18n.language === 'hu' ? 'active' : ''}>
          HU
        </button>
      </div>
      
      <div className="landing-content">
        <h1 className="app-title">{t('appTitle')}</h1>
        <p className="app-description">
          {t('chatWithAI')}
        </p>
        <button 
          className="start-button" 
          onClick={handleStartChat}
          disabled={loading}
        >
          {loading ? t('loading') : t('startChat')}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
