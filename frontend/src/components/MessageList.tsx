import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Message } from '../types';
import '../styles/MessageList.css';

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
    if (message.isAI || message.fromSessionId === 'ai') {
      return t('ai');
    }
    return message.fromSessionId === currentSessionId ? t('you') : t('partner');
  };

  const getMessageClass = (message: Message) => {
    if (message.isAI || message.fromSessionId === 'ai') {
      return 'message-bubble ai';
    }
    return message.fromSessionId === currentSessionId 
      ? 'message-bubble own' 
      : 'message-bubble partner';
  };

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div 
          key={message.messageId} 
          className={`message-container ${message.fromSessionId === currentSessionId ? 'own' : 'other'}`}
        >
          <div className={getMessageClass(message)}>
            <div className="message-sender">{getSenderLabel(message)}</div>
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">
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
