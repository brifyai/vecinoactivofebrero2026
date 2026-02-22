import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread: number;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  message: string;
  created_at: string;
  isOwn?: boolean;
}

// Cliente API
class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('vecino-token', token);
    } else {
      localStorage.removeItem('vecino-token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('vecino-token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(error.error || 'Error en la solicitud');
    }

    return response.json();
  }

  // Autenticación
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const result = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async register(email: string, password: string, name: string): Promise<{ token: string; user: User }> {
    const result = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(result.token);
    return result;
  }

  logout() {
    this.setToken(null);
  }

  // Chat Rooms
  async getChatRooms(): Promise<ChatRoom[]> {
    return this.request<ChatRoom[]>('/api/chat/rooms');
  }

  async createChatRoom(name: string, avatar?: string): Promise<ChatRoom> {
    return this.request<ChatRoom>('/api/chat/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, avatar }),
    });
  }

  // Mensajes
  async getMessages(roomId: string, limit?: number): Promise<ChatMessage[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<ChatMessage[]>(`/api/chat/rooms/${roomId}/messages${params}`);
  }

  async sendMessage(roomId: string, message: string): Promise<ChatMessage> {
    return this.request<ChatMessage>(`/api/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

// Socket.io client
class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });

    this.socket.on('new_message', (message: ChatMessage) => {
      this.emit('new_message', message);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string) {
    this.socket?.emit('join_room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave_room', roomId);
  }

  sendMessage(roomId: string, message: string, token: string) {
    this.socket?.emit('send_message', { roomId, message, token });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Instancias singleton
export const api = new ApiClient();
export const socketClient = new SocketClient();

export default api;