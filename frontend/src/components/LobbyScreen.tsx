import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../services/api';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import '../styles/LobbyScreen.css';

const LobbyScreen: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { messages, addAIMessage, addUserMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const welcomeMsg = t('chatWithAI');
    addAIMessage(welcomeMsg);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = inputMessage;
    setInputMessage('');

    addUserMessage(userMessage);

    setLoading(true);
    try {
      const response = await aiApi.chatWithAI({
        sessionId,
        message: userMessage,
      });
      addAIMessage(response.response);
    } catch (error) {
      console.error('Error chatting with AI:', error);
      addAIMessage('Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="lobby-screen">
      <div className="lobby-header">
        <h2>{t('waiting')}</h2>
        <div className="loading-spinner"></div>
      </div>

      <div className="lobby-content">
        <div className="ai-chat-section">
          <MessageList messages={messages} currentSessionId={sessionId || ''} />

          <div className="message-input-container">
            <textarea
              className="message-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('typeMessage')}
              disabled={loading}
              rows={2}
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
            >
              {loading ? '...' : t('sendMessage')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
