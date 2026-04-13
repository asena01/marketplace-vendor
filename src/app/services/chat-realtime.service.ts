import { Injectable, NgZone } from '@angular/core';
import { io } from 'socket.io-client';
import { apiConfig } from '../config/api-config';

export interface ChatRealtimeEvent {
  event?: string;
  chatId?: string;
  bookingId?: string;
  vendorType?: string;
  status?: string;
  updatedAt?: string;
  messageId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatRealtimeService {
  private readonly apiBaseUrl = this.resolveApiBaseUrl();
  private readonly socketBaseUrl = this.resolveSocketBaseUrl();
  private readonly socketPath = '/socket.io';

  constructor(private ngZone: NgZone) {}

  connectCustomer(userId: string, onEvent: (event: ChatRealtimeEvent) => void): () => void {
    return this.connect({
      query: { userId },
      sseUrl: `${this.apiBaseUrl}/customers/vendor-chats/stream?userId=${encodeURIComponent(userId)}`
    }, onEvent);
  }

  connectVendor(vendorId: string, onEvent: (event: ChatRealtimeEvent) => void): () => void {
    return this.connect({
      query: { vendorId },
      sseUrl: `${this.apiBaseUrl}/customers/vendor-chats-by-vendor/${encodeURIComponent(vendorId)}/stream?vendorId=${encodeURIComponent(vendorId)}`
    }, onEvent);
  }

  private connect(
    options: { query: Record<string, string>; sseUrl: string },
    onEvent: (event: ChatRealtimeEvent) => void
  ): () => void {
    if (!this.shouldUseSocketIo()) {
      return this.connectViaEventSource(options.sseUrl, onEvent);
    }

    const socket = io(this.socketBaseUrl, {
      path: this.socketPath,
      transports: ['websocket', 'polling'],
      query: options.query
    });

    let fallbackDisconnect: (() => void) | null = null;
    let hasConnected = false;

    const forward = (payload: ChatRealtimeEvent) => {
      this.ngZone.run(() => {
        onEvent(payload);
      });
    };

    const fallbackToEventSource = () => {
      if (fallbackDisconnect) {
        return;
      }
      socket.disconnect();
      fallbackDisconnect = this.connectViaEventSource(options.sseUrl, onEvent);
    };

    const fallbackTimer = window.setTimeout(() => {
      if (!hasConnected) {
        fallbackToEventSource();
      }
    }, 1500);

    socket.on('connect', () => {
      hasConnected = true;
      window.clearTimeout(fallbackTimer);
    });

    socket.on('connect_error', () => {
      window.clearTimeout(fallbackTimer);
      fallbackToEventSource();
    });

    socket.on('chat-created', forward);
    socket.on('chat-opened', forward);
    socket.on('message-created', forward);
    socket.on('connected', forward);

    return () => {
      window.clearTimeout(fallbackTimer);
      fallbackDisconnect?.();
      socket.disconnect();
    };
  }

  private connectViaEventSource(url: string, onEvent: (event: ChatRealtimeEvent) => void): () => void {
    const source = new EventSource(url);
    const forward = (rawEvent: MessageEvent<string>) => {
      this.ngZone.run(() => {
        try {
          onEvent(JSON.parse(rawEvent.data) as ChatRealtimeEvent);
        } catch {
          onEvent({ event: rawEvent.type });
        }
      });
    };

    source.addEventListener('chat-created', forward as EventListener);
    source.addEventListener('chat-opened', forward as EventListener);
    source.addEventListener('message-created', forward as EventListener);
    source.addEventListener('connected', forward as EventListener);

    return () => {
      source.close();
    };
  }

  private shouldUseSocketIo(): boolean {
    try {
      const parsed = new URL(this.apiBaseUrl);
      return parsed.hostname === 'https://api-qpczzmaezq-uc.a.run.app/customers' || parsed.hostname === 'https://api-qpczzmaezq-uc.a.run.app';
    } catch {
      return false;
    }
  }

  private resolveApiBaseUrl(): string {
    try {
      return apiConfig.getApiBaseUrl().replace(/\/$/, '');
    } catch {
      return 'https://api-qpczzmaezq-uc.a.run.app/customers';
    }
  }

  private resolveSocketBaseUrl(): string {
    try {
      const parsed = new URL(this.apiBaseUrl);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return 'https://api-qpczzmaezq-uc.a.run.app/customers';
    }
  }
}
