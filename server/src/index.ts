import express, { Request } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Extender el tipo Request para incluir user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Tipos
interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  message: string;
  created_at: string;
}

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        password_hash: passwordHash
      })
      .select()
      .single();

    if (error) throw error;

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }

    // Buscar usuario
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Middleware para verificar token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rutas de salas de chat
app.get('/api/chat/rooms', authenticateToken, async (req, res) => {
  try {
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(rooms || []);
  } catch (error: any) {
    console.error('Error al obtener salas:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat/rooms', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre de la sala es requerido' });
    }

    const { data: room, error } = await supabase
      .from('chat_rooms')
      .insert({
        name,
        avatar: avatar || '💬'
      })
      .select()
      .single();

    if (error) throw error;

    res.json(room);
  } catch (error: any) {
    console.error('Error al crear sala:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas de mensajes
app.get('/api/chat/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50 } = req.query;

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(Number(limit));

    if (error) throw error;

    res.json(messages || []);
  } catch (error: any) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;
    const user = req.user;

    if (!message) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        user_name: user.name,
        user_avatar: '👤',
        message
      })
      .select()
      .single();

    if (error) throw error;

    // Emitir mensaje a través de Socket.io
    io.to(roomId).emit('new_message', newMessage);

    res.json(newMessage);
  } catch (error: any) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas de servicios
app.get('/api/services', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('services')
      .select('*')
      .order('rating', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data: services, error } = await query;

    if (error) throw error;

    res.json(services || []);
  } catch (error: any) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(service);
  } catch (error: any) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services', authenticateToken, async (req, res) => {
  try {
    const { name, category, description, phone, email, address, image_url } = req.body;
    const user = req.user;

    if (!name || !category) {
      return res.status(400).json({ error: 'Nombre y categoría son requeridos' });
    }

    const { data: service, error } = await supabase
      .from('services')
      .insert({
        name,
        category,
        description,
        phone,
        email,
        address,
        image_url,
        is_verified: false
      })
      .select()
      .single();

    if (error) throw error;

    res.json(service);
  } catch (error: any) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas de eventos
app.get('/api/events', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date', { ascending: true });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data: events, error } = await query;

    if (error) throw error;

    res.json(events || []);
  } catch (error: any) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(event);
  } catch (error: any) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:id/attendees', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: attendees, error } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', id);

    if (error) throw error;

    res.json(attendees || []);
  } catch (error: any) {
    console.error('Error al obtener asistentes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { title, description, date, location, category, max_attendees, image_url } = req.body;
    const user = req.user;

    if (!title || !date || !category) {
      return res.status(400).json({ error: 'Título, fecha y categoría son requeridos' });
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        date,
        location,
        category,
        organizer_id: user.id,
        organizer_name: user.name,
        max_attendees,
        current_attendees: 0,
        image_url,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    res.json(event);
  } catch (error: any) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/attend', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Verificar si el evento existe y tiene cupos
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    if (event.max_attendees && event.current_attendees >= event.max_attendees) {
      return res.status(400).json({ error: 'El evento está lleno' });
    }

    // Agregar asistente
    const { error: attendeeError } = await supabase
      .from('event_attendees')
      .insert({
        event_id: id,
        user_id: user.id,
        user_name: user.name,
        user_email: user.email
      });

    if (attendeeError) {
      if (attendeeError.message.includes('duplicate')) {
        return res.status(400).json({ error: 'Ya estás registrado en este evento' });
      }
      throw attendeeError;
    }

    // Incrementar contador de asistentes
    await supabase
      .from('events')
      .update({ current_attendees: event.current_attendees + 1 })
      .eq('id', id);

    res.json({ message: 'Te has registrado en el evento' });
  } catch (error: any) {
    console.error('Error al registrarse en evento:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/events/:id/attend', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Verificar si el asistente existe
    const { data: attendee, error: attendeeError } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .single();

    if (attendeeError || !attendee) {
      return res.status(404).json({ error: 'No estás registrado en este evento' });
    }

    // Eliminar asistente
    await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', id)
      .eq('user_id', user.id);

    // Decrementar contador de asistentes
    const { data: event } = await supabase
      .from('events')
      .select('current_attendees')
      .eq('id', id)
      .single();

    if (event && event.current_attendees > 0) {
      await supabase
        .from('events')
        .update({ current_attendees: event.current_attendees - 1 })
        .eq('id', id);
    }

    res.json({ message: 'Te has retirado del evento' });
  } catch (error: any) {
    console.error('Error al retirarse de evento:', error);
    res.status(500).json({ error: error.message });
  }
});

// WebSockets para tiempo real
interface ConnectedUser {
  userId: string;
  socketId: string;
}

const connectedUsers = new Map<string, ConnectedUser>();

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} se unió a la sala ${roomId}`);
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} salió de la sala ${roomId}`);
  });

  socket.on('send_message', async (data: { roomId: string; message: string; token: string }) => {
    try {
      // Verificar token
      const decoded = jwt.verify(data.token, JWT_SECRET) as any;

      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: data.roomId,
          user_id: decoded.id,
          user_name: decoded.name,
          user_avatar: '👤',
          message: data.message
        })
        .select()
        .single();

      if (error) throw error;

      io.to(data.roomId).emit('new_message', newMessage);
    } catch (error) {
      console.error('Error al enviar mensaje por socket:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Inicializar tablas de Supabase si no existen
async function initializeDatabase() {
  try {
    // Crear tabla de usuarios si no existe
    const { error: usersError } = await supabase.from('users').select('id').limit(1);
    if (usersError && usersError.message.includes('does not exist')) {
      console.log('Creando tabla users...');
      await supabase.rpc('create_users_table', {});
    }

    // Crear tabla de salas de chat
    const { error: roomsError } = await supabase.from('chat_rooms').select('id').limit(1);
    if (roomsError && roomsError.message.includes('does not exist')) {
      console.log('Creando tabla chat_rooms...');
      await supabase.rpc('create_chat_rooms_table', {});
    }

    // Crear tabla de mensajes
    const { error: messagesError } = await supabase.from('chat_messages').select('id').limit(1);
    if (messagesError && messagesError.message.includes('does not exist')) {
      console.log('Creando tabla chat_messages...');
      await supabase.rpc('create_chat_messages_table', {});
    }

    console.log('Base de datos inicializada');
  } catch (error) {
    console.log('Error al inicializar base de datos:', error);
  }
}

// Insertar salas de chat por defecto
async function seedChatRooms() {
  try {
    const { data: existingRooms } = await supabase.from('chat_rooms').select('id');
    
    if (!existingRooms || existingRooms.length === 0) {
      console.log('Insertando salas de chat por defecto...');
      
      await supabase.from('chat_rooms').insert([
        { name: 'Junta de Vecinos', avatar: '👥' },
        { name: 'Seguridad UV4', avatar: '🛡️' },
        { name: 'Grupo Jardinería', avatar: '🌱' },
        { name: 'Mercado Comunitario', avatar: '🛒' }
      ]);
      
      console.log('Salas de chat creadas');
    }
  } catch (error) {
    console.log('Error al crear salas por defecto:', error);
  }
}

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  initializeDatabase();
  seedChatRooms();
});

export { app, io };