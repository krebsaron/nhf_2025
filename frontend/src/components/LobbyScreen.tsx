import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../services/api';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const LobbyScreen: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { messages, addAIMessage, addUserMessage } = useChat();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const welcomeMsg = t('chatWithAI');
    addAIMessage(welcomeMsg);
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !sessionId) return;

    addUserMessage(message);

    setLoading(true);
    try {
      const response = await aiApi.chatWithAI({
        sessionId,
        message: message,
      });
      addAIMessage(response.response);
    } catch (error) {
      console.error('Error chatting with AI:', error);
      addAIMessage('Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:flex md:items-center md:justify-center md:min-h-screen">
      <div className="flex flex-col h-screen md:h-[95vh] w-full max-w-4xl bg-white shadow-xl md:rounded-2xl overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-[#764ba2] to-[#667eea] text-white text-center flex items-center justify-center gap-4">
        <h2 className="m-0 text-xl font-bold">{t('waiting')}</h2>
        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>

      <MessageList messages={messages} currentSessionId={sessionId || ''} />

      <MessageInput 
        showAIFeatures={false} 
        onSendMessage={handleSendMessage} 
        isLoading={loading} 
      />
      </div>
    </div>
  );
};

export default LobbyScreen;
