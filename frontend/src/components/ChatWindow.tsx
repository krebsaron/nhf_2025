import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import '../styles/ChatWindow.css';

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
    <div className="chat-window">
      <div className="chat-header">
        <h2>{t('appTitle')}</h2>
        <button className="end-chat-button" onClick={handleEndChat}>
          {t('endChat')}
        </button>
      </div>

      <MessageList messages={messages} currentSessionId={sessionId} />

      {!partnerDisconnected && <MessageInput />}

      {showDisconnectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t('partnerDisconnected')}</h3>
            <div className="modal-buttons">
              <button onClick={handleBackToLobby}>{t('newChat')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
