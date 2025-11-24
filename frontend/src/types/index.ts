export interface Message {
  messageId: string;
  fromSessionId: string;
  content: string;
  timestamp: string;
  isAI: boolean;
}

export interface SessionResponse {
  sessionId: string;
  status: string;
}

export interface MatchResponse {
  roomId: string;
  partnerSessionId: string;
}

export interface ChatMessageRequest {
  roomId: string;
  sessionId: string;
  content: string;
}

export interface AIChatRequest {
  sessionId: string;
  message: string;
}

export interface AIChatResponse {
  response: string;
}

export interface AIAssistRequest {
  prompt?: string;
  text?: string;
}
