import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_BASE_URL = '/ws';

export class WebSocketService {
  private client: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000;

  connect(onConnect: () => void, onError: (error: any) => void): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL) as any,
      debug: (str) => {
        console.log('STOMP:', str);
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        onConnect();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        onError(frame);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        } else {
          onError(error);
        }
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  subscribe(destination: string, callback: (message: IMessage) => void): void {
    if (this.client && this.client.connected) {
      this.client.subscribe(destination, callback);
    } else {
      console.error('WebSocket not connected');
    }
  }

  send(destination: string, body: any): void {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error('WebSocket not connected');
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const webSocketService = new WebSocketService();
