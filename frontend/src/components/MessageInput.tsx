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

  return (
    <div className="message-input-wrapper">
      <div className="message-input-container">
        <textarea
          className="message-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('typeMessage')}
          rows={2}
        />
        <div className="input-buttons">
          <button
            className="ai-assist-button"
            onClick={() => setShowAIModal(true)}
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
        />
      )}
    </div>
  );
};

export default MessageInput;
