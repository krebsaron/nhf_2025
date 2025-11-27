import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sessionApi } from '../services/api';
import { useChat } from '../context/ChatContext';

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
    <div className="flex flex-col items-center justify-center min-h-screen p-5 relative">
      <div className="absolute top-5 right-5 flex gap-2.5">
        <button 
          onClick={() => changeLanguage('en')} 
          className={`px-4 py-2 border-2 border-white rounded-md font-bold transition-all duration-300 cursor-pointer ${i18n.language === 'en' ? 'bg-white text-[#667eea]' : 'bg-transparent text-white hover:bg-white hover:text-[#667eea]'}`}
        >
          EN
        </button>
        <button 
          onClick={() => changeLanguage('hu')} 
          className={`px-4 py-2 border-2 border-white rounded-md font-bold transition-all duration-300 cursor-pointer ${i18n.language === 'hu' ? 'bg-white text-[#667eea]' : 'bg-transparent text-white hover:bg-white hover:text-[#667eea]'}`}
        >
          HU
        </button>
      </div>
      
      <div className="text-center bg-white p-10 md:p-16 rounded-2xl shadow-2xl max-w-lg w-full">
        <h1 className="text-4xl md:text-5xl text-[#667eea] mb-5 font-bold">{t('appTitle')}</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
          {t('chatWithAI')}
        </p>
        <button 
          className="px-12 py-4 text-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-full cursor-pointer transition-transform duration-300 font-bold hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
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
