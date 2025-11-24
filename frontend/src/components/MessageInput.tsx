import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '../context/ChatContext';
import AIAssistModal from './AIAssistModal';
import '../styles/MessageInput.css';

const MessageInput: React.FC = () => {
  const { t } = useTranslation();
  const { sendMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiMode, setAiMode] = useState<'enhance' | 'assist'>('assist');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAISuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    setShowAIModal(false);
  };

  const openAIModal = (mode: 'enhance' | 'assist') => {
    setAiMode(mode);
    setShowAIModal(true);
  };

  return (
    <div className="message-input-wrapper">
      <div className="message-input-container">
        <div className="textarea-wrapper">
          <textarea
            className="message-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('typeMessage')}
            rows={2}
          />
          <button
            className="enhance-button"
            onClick={() => openAIModal('enhance')}
            title="Enhance message"
            disabled={!inputMessage.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2 11 5"/>
            </svg>
          </button>
        </div>
        <div className="input-buttons">
          <button
            className="ai-assist-button"
            onClick={() => openAIModal('assist')}
            title={t('aiAssist')}
          >
            AI
          </button>
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            {t('sendMessage')}
          </button>
        </div>
      </div>

      {showAIModal && (
        <AIAssistModal
          currentText={inputMessage}
          onAccept={handleAISuggestion}
          onClose={() => setShowAIModal(false)}
          mode={aiMode}
        />
      )}
    </div>
  );
};

export default MessageInput;
