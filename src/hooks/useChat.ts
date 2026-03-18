import { useState, useEffect, useCallback } from 'react';
import { api, socketClient, ChatRoom, ChatMessage } from '../lib/api';

export function useChat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar salas de chat
  const loadRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getChatRooms();
      setRooms(data.map(room => ({ ...room, unread: 0 })));
    } catch (err: any) {
      console.error('Error cargando salas:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar mensajes de una sala
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      setIsLoading(true);
      const data = await api.getMessages(roomId);
      const token = api.getToken();
      const currentUser = token ? JSON.parse(atob(token.split('.')[1])) : null;
      
      setMessages(data.map(msg => ({
        ...msg,
        isOwn: currentUser ? msg.user_id === currentUser.id : false
      })));
    } catch (err: any) {
      console.error('Error cargando mensajes:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(async (message: string) => {
    if (!activeRoom || !message.trim()) return;

    try {
      const token = api.getToken();
      if (token) {
        // Usar Socket.io para tiempo real
        socketClient.sendMessage(activeRoom.id, message, token);
      } else {
        // Fallback a API REST
        const newMessage = await api.sendMessage(activeRoom.id, message);
        setMessages(prev => [...prev, { ...newMessage, isOwn: true }]);
      }
    } catch (err: any) {
      console.error('Error enviando mensaje:', err);
      setError(err.message);
    }
  }, [activeRoom]);

  // Seleccionar sala
  const selectRoom = useCallback((room: ChatRoom) => {
    setActiveRoom(room);
    loadMessages(room.id);
    socketClient.joinRoom(room.id);
  }, [loadMessages]);

  // Inicializar conexión
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      socketClient.connect(token);
      loadRooms();
    }

    // Escuchar nuevos mensajes
    socketClient.on('new_message', (message: ChatMessage) => {
      if (activeRoom && message.room_id === activeRoom.id) {
        const token = api.getToken();
        const currentUser = token ? JSON.parse(atob(token.split('.')[1])) : null;
        setMessages(prev => [...prev, { 
          ...message, 
          isOwn: currentUser ? message.user_id === currentUser.id : false 
        }]);
      }
    });

    return () => {
      if (activeRoom) {
        socketClient.leaveRoom(activeRoom.id);
      }
    };
  }, [loadRooms, activeRoom]);

  return {
    rooms,
    messages,
    activeRoom,
    isLoading,
    error,
    loadRooms,
    loadMessages,
    sendMessage,
    selectRoom,
    setActiveRoom
  };
}

export default useChat;