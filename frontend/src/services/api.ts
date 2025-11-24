import axios from 'axios';
import type { 
  SessionResponse, 
  AIChatRequest, 
  AIChatResponse, 
  AIAssistRequest 
} from '../types';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sessionApi = {
  createSession: async (): Promise<SessionResponse> => {
    const response = await apiClient.post<SessionResponse>('/session/create');
    return response.data;
  },

  joinLobby: async (sessionId: string): Promise<void> => {
    await apiClient.post(`/session/join-lobby/${sessionId}`);
  },

  getSession: async (sessionId: string): Promise<SessionResponse> => {
    const response = await apiClient.get<SessionResponse>(`/session/${sessionId}`);
    return response.data;
  },
};

export const aiApi = {
  chatWithAI: async (request: AIChatRequest): Promise<AIChatResponse> => {
    const response = await apiClient.post<AIChatResponse>('/ai/chat', request);
    return response.data;
  },

  assistMessage: async (request: AIAssistRequest): Promise<AIChatResponse> => {
    const response = await apiClient.post<AIChatResponse>('/ai/assist', request);
    return response.data;
  },
};
