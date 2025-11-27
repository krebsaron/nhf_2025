import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '../context/ChatContext';
import AIAssistModal from './AIAssistModal';

interface MessageInputProps {
  showAIFeatures?: boolean;
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  showAIFeatures = true, 
  onSendMessage, 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const { sendMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiMode, setAiMode] = useState<'enhance' | 'assist'>('assist');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    if (onSendMessage) {
      onSendMessage(inputMessage);
    } else {
      sendMessage(inputMessage);
    }
    
    setInputMessage('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        {showAIFeatures && (
        <button
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-gray-500 hover:text-[#667eea] hover:bg-purple-50 rounded-full transition-colors mb-1"
          onClick={() => openAIModal('assist')}
          title={t('aiAssist')}
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
          </svg>
        </button>
        )}

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            className="w-full py-3 pl-4 pr-12 bg-gray-100 border-0 rounded-[24px] text-base focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#667eea] transition-all placeholder-gray-400 overflow-y-auto scrollbar-hide"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('typeMessage')}
            rows={1}
            disabled={isLoading}
            style={{ 
              minHeight: '48px',
              maxHeight: '150px', 
              resize: 'none'      
            }}
          />
          
          {showAIFeatures && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-700 rounded-full hover:bg-gray-100 hover:text-gray-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:ring-offset-1"
            onClick={() => openAIModal('enhance')}
            title="Enhance message"
            disabled={!inputMessage.trim() || isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2 11 5"/>
            </svg>
          </button>
          )}
        </div>

        <button
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#667eea] text-white rounded-full hover:bg-[#5568d3] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-1"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
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