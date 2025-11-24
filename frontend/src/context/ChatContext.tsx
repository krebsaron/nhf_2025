import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { webSocketService } from '../services/websocket';
import type { Message, MatchResponse } from '../types';

interface ChatContextType {
  sessionId: string | null;
  roomId: string | null;
  messages: Message[];
  partnerSessionId: string | null;
  isConnected: boolean;
  partnerDisconnected: boolean;
  sendMessage: (content: string) => void;
  endChat: () => void;
  setSessionId: (id: string) => void;
  addAIMessage: (content: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionId, setSessionIdState] = useState<string | null>(() => {
    return sessionStorage.getItem('sessionId');
  });
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerSessionId, setPartnerSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [partnerDisconnected, setPartnerDisconnected] = useState(false);
  const navigate = useNavigate();

  const setSessionId = (id: string) => {
    setSessionIdState(id);
    sessionStorage.setItem('sessionId', id);
  };

  useEffect(() => {
    if (!sessionId) return;

    const handleConnect = () => {
      setIsConnected(true);

      // Subscribe to match notifications
      webSocketService.subscribe(`/queue/match/${sessionId}`, (message) => {
        const match: MatchResponse = JSON.parse(message.body);
        setRoomId(match.roomId);
        setPartnerSessionId(match.partnerSessionId);
        setMessages([]);
        setPartnerDisconnected(false);
        navigate(`/chat/${match.roomId}`);
      });

      // Subscribe to chat messages
      webSocketService.subscribe(`/queue/messages/${sessionId}`, (message) => {
        const chatMessage: Message = JSON.parse(message.body);
        setMessages((prev) => [...prev, chatMessage]);
      });

      // Subscribe to disconnect notifications
      webSocketService.subscribe(`/queue/disconnect/${sessionId}`, () => {
        setPartnerDisconnected(true);
      });
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    webSocketService.connect(handleConnect, handleError);

    return () => {
      webSocketService.disconnect();
    };
  }, [sessionId, navigate]);

  const sendMessage = (content: string) => {
    if (!sessionId || !roomId) return;

    webSocketService.send('/app/chat.send', {
      roomId,
      sessionId,
      content,
    });
  };

  const endChat = () => {
    if (sessionId) {
      webSocketService.send('/app/chat.disconnect', sessionId);
      setRoomId(null);
      setMessages([]);
      setPartnerSessionId(null);
      setPartnerDisconnected(false);
    }
  };

  const addAIMessage = (content: string) => {
    const aiMessage: Message = {
      messageId: `ai-${Date.now()}`,
      fromSessionId: 'ai',
      content,
      timestamp: new Date().toISOString(),
      isAI: true,
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  return (
    <ChatContext.Provider
      value={{
        sessionId,
        roomId,
        messages,
        partnerSessionId,
        isConnected,
        partnerDisconnected,
        sendMessage,
        endChat,
        setSessionId,
        addAIMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
