import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  currentSessionId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentSessionId }) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSenderLabel = (message: Message) => {
    if (message.isAI) {
      return t('ai');
    }
    if (message.fromSessionId === 'ai') {
      return t('ai');
    }
    return message.fromSessionId === currentSessionId ? t('you') : t('partner');
  };

  const getMessageClasses = (message: Message) => {
    const baseClasses = "max-w-[85%] md:max-w-[70%] p-3 px-4 rounded-2xl break-words transition-all duration-300";
    
    if (message.isAI || message.fromSessionId === 'ai') {
      return `${baseClasses} bg-[#e3f2fd] text-[#1565c0] rounded-bl-sm border-l-4 border-[#1565c0]`;
    }
    
    if (message.fromSessionId === currentSessionId) {
      return `${baseClasses} bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-br-sm`;
    }
    
    return `${baseClasses} bg-[#f0f0f0] text-[#333] rounded-bl-sm`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
      {messages.map((message) => (
        <div 
          key={message.messageId} 
          className={`flex flex-col ${message.fromSessionId === currentSessionId ? 'items-end' : 'items-start'}`}
        >
          <div className={getMessageClasses(message)}>
            <div className="text-xs font-bold mb-1 opacity-80">{getSenderLabel(message)}</div>
            <div className="text-base leading-snug mb-1">{message.content}</div>
            <div className="text-xs opacity-60 text-right">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
