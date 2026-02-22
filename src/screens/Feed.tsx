import React from 'react';
import { Card } from '../components/ui/Card';
import { 
  MessageCircle, 
  Handshake, 
  Share2, 
  MapPin, 
  Image as ImageIcon,
  MoreHorizontal,
  MessageSquare,
  Send,
  Users,
  Search
} from 'lucide-react';

interface ChatMessage {
  id: number;
  user: string;
  avatar: string;
  message: string;
  time: string;
  isOwn: boolean;
}

interface ChatRoom {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
}

export function Feed() {
  const [newPostText, setNewPostText] = React.useState('');
  const [newMessage, setNewMessage] = React.useState('');
  const [activeChat, setActiveChat] = React.useState<number | null>(1);
  const [posts, setPosts] = React.useState([
    {
      id: 1,
      user: 'Camila Soto',
      time: 'Hace 2h',
      content: '¡Gracias a todos los vecinos que participaron en la limpieza del parque hoy! 🌳✨ Quedó hermoso.',
      image: 'https://images.unsplash.com/photo-1584467735867-4297ae2ebcee?q=80&w=1000&auto=format&fit=crop',
      likes: 24,
      comments: 5,
      location: 'Parque Central'
    },
    {
      id: 2,
      user: 'Roberto Díaz',
      time: 'Hace 4h',
      content: 'Encontré este perrito cerca de la calle Los Alerces. ¿Alguien lo reconoce? 🐶',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop',
      likes: 45,
      comments: 12,
      location: 'Calle Los Alerces'
    }
  ]);

  const [chatRooms] = React.useState<ChatRoom[]>([
    {
      id: 1,
      name: 'Junta de Vecinos',
      avatar: '👥',
      lastMessage: 'Reunión mañana a las 18:00',
      time: '10:30',
      unread: 3,
      isOnline: true
    },
    {
      id: 2,
      name: 'Seguridad UV4',
      avatar: '🛡️',
      lastMessage: 'Todo tranquilo por ahora',
      time: '09:45',
      unread: 0,
      isOnline: true
    },
    {
      id: 3,
      name: 'María González',
      avatar: '👩',
      lastMessage: 'Gracias por la información!',
      time: 'Ayer',
      unread: 1,
      isOnline: false
    },
    {
      id: 4,
      name: 'Grupo Jardinería',
      avatar: '🌱',
      lastMessage: '¿Quién tiene semillas?',
      time: 'Ayer',
      unread: 0,
      isOnline: true
    }
  ]);

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 1,
      user: 'Carlos M.',
      avatar: '👨',
      message: '¿Alguien sabe a qué hora es la reunión de mañana?',
      time: '10:15',
      isOwn: false
    },
    {
      id: 2,
      user: 'Tú',
      avatar: '👤',
      message: 'A las 18:00 en la sede social',
      time: '10:20',
      isOwn: true
    },
    {
      id: 3,
      user: 'Ana P.',
      avatar: '👩',
      message: 'Perfecto, ahí estaré. ¿Alguien necesita ayuda con algo?',
      time: '10:25',
      isOwn: false
    },
    {
      id: 4,
      user: 'Carlos M.',
      avatar: '👨',
      message: 'Reunión mañana a las 18:00',
      time: '10:30',
      isOwn: false
    }
  ]);

  const handlePublish = () => {
    if (newPostText.trim()) {
      const newPost = {
        id: Date.now(),
        user: 'Yo',
        time: 'Ahora',
        content: newPostText,
        image: '',
        likes: 0,
        comments: 0,
        location: 'Mi ubicación'
      };
      setPosts([newPost, ...posts]);
      setNewPostText('');
      console.log('Publicando:', newPostText);
    }
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
    console.log('Like en post:', postId);
  };

  const handleComment = (postId: number) => {
    console.log('Comentar en post:', postId);
  };

  const handleShare = (postId: number) => {
    console.log('Compartir post:', postId);
  };

  const handleAddImage = () => {
    console.log('Agregar imagen al post');
  };

  const handleAddLocation = () => {
    console.log('Agregar ubicación al post');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now(),
        user: 'Tú',
        avatar: '👤',
        message: newMessage,
        time: 'Ahora',
        isOwn: true
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 animate-fade-in pt-16 lg:pt-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenido principal - Posts */}
          <div className="lg:col-span-2 space-y-6">
            <header className="mb-4 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                Noticias <MessageSquare className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400" />
              </h1>
              <p className="text-gray-400 text-sm lg:text-base">Mantente al día con lo que sucede en tu barrio.</p>
            </header>

            <Card className="p-4 bg-white/5 border-white/10">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0">
                  Yo
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="¿Qué está pasando en tu vecindario?"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 focus:outline-none py-2 text-sm lg:text-base"
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <div className="flex gap-4">
                      <button onClick={handleAddImage} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button onClick={handleAddLocation} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                    <button onClick={handlePublish} className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600 transition-colors">
                      Publicar
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        {post.user.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm lg:text-base">{post.user}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{post.time}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {post.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-white transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-gray-200 mb-4 leading-relaxed text-sm lg:text-base">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-white/5 aspect-video">
                      <img src={post.image} alt="Post content" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors group">
                      <Handshake className="w-5 h-5 group-hover:fill-emerald-400/20" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button onClick={() => handleComment(post.id)} className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button onClick={() => handleShare(post.id)} className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm">Compartir</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Chat Panel - Lado derecho */}
          <div className="hidden lg:block">
            <div className="sticky top-24 border border-white/10 rounded-2xl bg-black/20 backdrop-blur-sm overflow-hidden">
              <div className="flex flex-col h-[calc(100vh-8rem)]">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-emerald-400" />
                      Chat Vecinal
                    </h2>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <Users className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Buscar conversación..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Chat Rooms List */}
                <div className="flex-1 overflow-y-auto">
                  {chatRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setActiveChat(room.id)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${
                        activeChat === room.id ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                          {room.avatar}
                        </div>
                        {room.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white text-sm truncate">{room.name}</h3>
                          <span className="text-xs text-gray-500">{room.time}</span>
                        </div>
                        <p className="text-gray-400 text-xs truncate">{room.lastMessage}</p>
                      </div>
                      {room.unread > 0 && (
                        <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                          {room.unread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Active Chat Messages */}
                {activeChat && (
                  <div className="border-t border-white/10 flex flex-col h-64">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end gap-2 max-w-[80%] ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs flex-shrink-0">
                              {msg.avatar}
                            </div>
                            <div className={`px-3 py-2 rounded-xl text-sm ${
                              msg.isOwn
                                ? 'bg-emerald-500 text-white rounded-br-none'
                                : 'bg-white/10 text-gray-200 rounded-bl-none'
                            }`}>
                              <p>{msg.message}</p>
                              <span className={`text-xs ${msg.isOwn ? 'text-emerald-200' : 'text-gray-500'} block mt-1`}>
                                {msg.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Escribe un mensaje..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
