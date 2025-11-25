import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow: React.FC = () => {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { sessionId, messages, partnerDisconnected, endChat } = useChat();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  useEffect(() => {
    if (partnerDisconnected) {
      setShowDisconnectModal(true);
    }
  }, [partnerDisconnected]);

  const handleEndChat = () => {
    endChat();
    navigate('/');
  };

  const handleBackToLobby = () => {
    endChat();
    navigate('/');
  };

  if (!sessionId || !roomId) {
    return <div>Error: Invalid session</div>;
  }

  return (
    <div className="md:flex md:items-center md:justify-center md:min-h-screen">
      <div className="flex flex-col h-screen md:h-[95vh] w-full max-w-4xl bg-white shadow-xl md:rounded-2xl overflow-hidden">
      <div className="px-6 py-3 bg-gradient-to-r from-[#764ba2] to-[#667eea] text-white flex justify-between items-center shadow-sm">
        <h2 className="m-0 text-lg font-semibold tracking-wide">{t('appTitle')}</h2>
        <button 
          className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20" 
          onClick={handleEndChat}
        >
          {t('endChat')}
        </button>
      </div>

      <MessageList messages={messages} currentSessionId={sessionId} />

      {!partnerDisconnected && <MessageInput />}

      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-[90%] text-center">
            <h3 className="mb-5 text-gray-800 text-xl font-bold">{t('partnerDisconnected')}</h3>
            <div className="flex gap-2.5 justify-center">
              <button 
                className="px-6 py-3 border-none rounded-lg cursor-pointer font-bold transition-transform hover:-translate-y-0.5 bg-[#667eea] text-white"
                onClick={handleBackToLobby}
              >
                {t('newChat')}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ChatWindow;
