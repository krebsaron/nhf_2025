import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../services/api';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';

const LobbyScreen: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { messages, addAIMessage, addUserMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Ref to control the textarea DOM element directly for resizing
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight for shrinking
      textareaRef.current.style.height = 'auto'; 
      // Set height to scrollHeight (content height)
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  useEffect(() => {
    const welcomeMsg = t('chatWithAI');
    addAIMessage(welcomeMsg);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = inputMessage;
    setInputMessage('');
    
    // Reset height manually after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

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
    <div className="md:flex md:items-center md:justify-center md:min-h-screen">
      <div className="flex flex-col h-screen md:h-[95vh] w-full max-w-4xl bg-white shadow-xl md:rounded-2xl overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-[#764ba2] to-[#667eea] text-white text-center flex items-center justify-center gap-4">
        <h2 className="m-0 text-xl font-bold">{t('waiting')}</h2>
        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>

      <MessageList messages={messages} currentSessionId={sessionId || ''} />

      <div className="p-5">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                className="w-full py-3 pl-4 pr-4 bg-gray-100 border-0 rounded-[24px] text-base focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#667eea] transition-all placeholder-gray-400 overflow-y-auto scrollbar-hide"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('typeMessage')}
                disabled={loading}
                rows={1}
                style={{ 
                  minHeight: '48px',
                  maxHeight: '150px',
                  resize: 'none'
                }}
              />
            </div>
            <button
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#667eea] text-white rounded-full hover:bg-[#5568d3] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-1"
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </div>
      </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
