import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
dotenv.config();

// ============================================
// CONFIGURACIÓN DE PATHS
// ============================================
// En producción, el frontend estático está en ../dist (relativo a dist/index.js)
// En desarrollo, usamos el root del proyecto
const isProduction = process.env.NODE_ENV === 'production';
const STATIC_PATH = isProduction 
  ? path.join(__dirname, '../../dist')  // dist está al mismo nivel que server/
  : path.join(__dirname, '../../dist'); // Mismo path para desarrollo

console.log('📁 Static path:', STATIC_PATH);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');


// Validación de variables de entorno requeridas
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Error: Variables de entorno faltantes:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPor favor configura el archivo .env.production');
  process.exit(1);
}

// Validar JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET!;

// Lista de valores placeholder que no deben usarse en producción
const INVALID_JWT_SECRETS = [
  'your-super-secret-jwt-token-with-at-least-32-characters-long',
  'REEMPLAZAR_CON_UN_SECRET_SEGURO_DE_64_CARACTERES_MINIMO',
  'REEMPLAZAR_CON_UN_SECRET_SEGURO_DE_128_CARACTERES_HEX',
  'REPLACE_WITH_A_SECURE_128_HEX_CHAR_SECRET',
  'your_jwt_secret_here_change_in_production',
  'your_jwt_secret_here'
];

// Validación 1: No usar placeholders
if (INVALID_JWT_SECRETS.includes(JWT_SECRET)) {
  console.error('❌ Error: JWT_SECRET es un valor placeholder. Debes generar una clave segura.');
  console.error('   Genera una clave segura con:');
  console.error('   node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  console.error('   Esto genera 128 caracteres hexadecimales (64 bytes de entropía)');
  process.exit(1);
}

// Validación 2: Longitud mínima de seguridad (64 caracteres = 256 bits)
if (JWT_SECRET.length < 64) {
  console.error('❌ Error: JWT_SECRET debe tener al menos 64 caracteres para seguridad adecuada');
  console.error(`   Longitud actual: ${JWT_SECRET.length} caracteres`);
  console.error('   Recomendado: 128 caracteres hexadecimales (generados con crypto.randomBytes(64))');
  process.exit(1);
}

// Validación 3: Entropía mínima (debe ser hexadecimal o base64)
const isHex = /^[a-f0-9]+$/i.test(JWT_SECRET);
const isBase64 = /^[A-Za-z0-9+/=]+$/.test(JWT_SECRET);
if (!isHex && !isBase64) {
  console.warn('⚠️  Advertencia: JWT_SECRET no parece ser hexadecimal ni base64.');
  console.warn('   Se recomienda usar: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
}

console.log('✅ Variables de entorno validadas correctamente');

// Extender el tipo Request para incluir user
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

const app = express();

// Trust proxy: Express está detrás de nginx
// nginx envía X-Forwarded-For, Express debe confiar en ese header
app.set('trust proxy', 1);

const httpServer = createServer(app);

// Configurar orígenes CORS permitidos
// En producción, CORS_ORIGIN debe contener solo los dominios explícitos permitidos
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:4001', 'https://vecinoactivo.cl', 'https://www.vecinoactivo.cl'];

// Validar que no se use wildcard en producción
if (allowedOrigins.includes('*')) {
  console.error('❌ Error: CORS_ORIGIN no debe contener wildcard "*" en producción');
  console.error('   Orígenes permitidos:', allowedOrigins);
  console.error('   Configura explícitamente los dominios permitidos en CORS_ORIGIN');
  process.exit(1);
}

console.log('✅ CORS configurado para orígenes:', allowedOrigins);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 3001;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware CORS con múltiples orígenes
// Configuración que permite:
// - Requests sin Origin (curl, Postman, health checks)
// - Solo orígenes explícitos del navegador
// - Credentials (cookies, auth headers)
app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origin (curl, Postman, health checks, apps móviles)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar si el origen está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('⛔ CORS bloqueado - Origen no permitido:', origin);
      // No llamamos al callback con error, simplemente no permitimos el origen
      // Esto evita el error 500 y deja que el navegador maneje el CORS
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para loggear requests bloqueados por CORS (opcional, para debugging)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    console.log('⛔ Request de origen no permitido:', origin, '- Path:', req.path);
  }
  next();
});
app.use(express.json());

// ============================================
// SERVIR FRONTEND ESTÁTICO (Node.js puro)
// ============================================
// Verificar que existe el directorio dist
if (fs.existsSync(STATIC_PATH)) {
  console.log('✅ Frontend estático encontrado en:', STATIC_PATH);
  
  // Servir archivos estáticos
  app.use(express.static(STATIC_PATH, {
    maxAge: '1y', // Cache de 1 año para assets
    immutable: true,
    setHeaders: (res, path) => {
      // No cachear index.html
      if (path.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));
  
  console.log('✅ Static middleware configurado');
} else {
  console.warn('⚠️  Frontend estático NO encontrado en:', STATIC_PATH);
  console.warn('   Ejecuta "npm run build" en el root para generar el frontend');
}

// ============================================
// RATE LIMITING - Segunda capa de protección
// ============================================
// NOTA: Nginx tiene rate limiting en la primera capa (5r/m)
// Express tiene límite más alto (10r/m) para evitar falsos positivos
// Si nginx falla, Express aún protege contra abuso

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requests por minuto (doble que nginx)
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Demasiados intentos. Por favor espera 1 minuto.',
      code: 'RATE_LIMIT_EXCEEDED',
      retry_after: 60
    });
  }
  // No necesita keyGenerator: trust proxy está configurado,
  // express-rate-limit usa req.ip automáticamente
});

console.log('✅ Rate limiting configurado: 10 requests/minuto para auth');

// ============================================
// VALIDACIÓN DE INPUTS DE AUTENTICACIÓN
// ============================================

// Validar formato de email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar fortaleza de contraseña
// Requisitos: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false; // Al menos 1 mayúscula
  if (!/[a-z]/.test(password)) return false; // Al menos 1 minúscula
  if (!/[0-9]/.test(password)) return false; // Al menos 1 número
  return true;
};

// Sanitizar y validar inputs de registro
const validateRegisterInput = (body: unknown): { valid: boolean; error?: string; data?: { email: string; password: string; name: string } } => {
  // Type guard para verificar que body es un objeto
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'El cuerpo de la petición debe ser un objeto JSON' };
  }

  const b = body as Record<string, unknown>;
  const { email, password, name } = b;

  // Validar tipos
  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
    return { valid: false, error: 'Todos los campos deben ser texto' };
  }

  // RECHAZAR longitudes excesivas (no truncar silenciosamente)
  if (email.length > 254) {
    return { valid: false, error: 'El email es demasiado largo (máximo 254 caracteres)' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'El nombre es demasiado largo (máximo 100 caracteres)' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'La contraseña es demasiado larga (máximo 128 caracteres)' };
  }

  // Sanitizar: trim y lowercase
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedName = name.trim();
  // No hacer trim a password (los espacios iniciales/finales pueden ser intencionales)

  // Validar email vacío
  if (!sanitizedEmail) {
    return { valid: false, error: 'El email es requerido' };
  }

  // Validar formato de email
  if (!isValidEmail(sanitizedEmail)) {
    return { valid: false, error: 'El formato del email no es válido' };
  }

  // Validar nombre vacío
  if (!sanitizedName) {
    return { valid: false, error: 'El nombre es requerido' };
  }

  // Validar longitud mínima del nombre
  if (sanitizedName.length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  // Validar contraseña vacía
  if (!password) {
    return { valid: false, error: 'La contraseña es requerida' };
  }

  // Validar fortaleza de contraseña
  if (!isStrongPassword(password)) {
    return { 
      valid: false, 
      error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número' 
    };
  }

  return { 
    valid: true, 
    data: { 
      email: sanitizedEmail, 
      password, 
      name: sanitizedName 
    } 
  };
};

// Sanitizar y validar inputs de login
const validateLoginInput = (body: unknown): { valid: boolean; error?: string; data?: { email: string; password: string } } => {
  // Type guard para verificar que body es un objeto
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'El cuerpo de la petición debe ser un objeto JSON' };
  }

  const b = body as Record<string, unknown>;
  const { email, password } = b;

  // Validar tipos
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { valid: false, error: 'Email y contraseña deben ser texto' };
  }

  // RECHAZAR longitudes excesivas (no truncar silenciosamente)
  if (email.length > 254) {
    return { valid: false, error: 'El email es demasiado largo (máximo 254 caracteres)' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'La contraseña es demasiado larga (máximo 128 caracteres)' };
  }

  // Sanitizar: trim y lowercase
  const sanitizedEmail = email.trim().toLowerCase();
  // No hacer trim a password

  // Validar email vacío
  if (!sanitizedEmail) {
    return { valid: false, error: 'El email es requerido' };
  }

  // Validar formato de email (nuevo en login)
  if (!isValidEmail(sanitizedEmail)) {
    return { valid: false, error: 'El formato del email no es válido' };
  }

  // Validar contraseña vacía
  if (!password) {
    return { valid: false, error: 'La contraseña es requerida' };
  }

  return { 
    valid: true, 
    data: { 
      email: sanitizedEmail, 
      password 
    } 
  };
};

// Tipos
interface User {
  id: number;
  email: string;
  name: string;
  password_hash?: string;
}

interface ChatRoom {
  id: number;
  name: string;
  avatar: string;
  created_at: string;
}

interface ChatMessage {
  id: number;
  room_id: number;
  user_id: number;
  user_name: string;
  user_avatar: string;
  message: string;
  created_at: string;
}

// Rutas de autenticación con rate limiting
app.post('/api/auth/register', authRateLimiter, async (req, res) => {
  try {
    // Validar y sanitizar inputs
    const validation = validateRegisterInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { email, password, name } = validation.data!;

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

app.post('/api/auth/login', authRateLimiter, async (req, res) => {
  try {
    // Validar y sanitizar inputs
    const validation = validateLoginInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { email, password } = validation.data!;

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
const authenticateToken = (req: AuthRequest, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    // Validar que decoded.id sea un número entero válido y positivo
    const userId = Number(decoded.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Validar que email y name existan y sean strings
    if (!decoded.email || typeof decoded.email !== 'string' || !decoded.name || typeof decoded.name !== 'string') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = {
      id: userId,
      email: decoded.email,
      name: decoded.name
    };
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
app.get('/api/chat/rooms/:roomId/messages', authenticateToken, async (req: AuthRequest, res) => {
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

app.post('/api/chat/rooms/:roomId/messages', authenticateToken, async (req: AuthRequest, res) => {
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
        user_id: user!.id,
        user_name: user!.name,
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

app.post('/api/services', authenticateToken, async (req: AuthRequest, res) => {
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

app.post('/api/events', authenticateToken, async (req: AuthRequest, res) => {
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
        organizer_id: user!.id,
        organizer_name: user!.name,
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

app.post('/api/events/:id/attend', authenticateToken, async (req: AuthRequest, res) => {
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
        user_id: user!.id,
        user_name: user!.name,
        user_email: user!.email
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

app.delete('/api/events/:id/attend', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Verificar si el asistente existe
    const { data: attendee, error: attendeeError } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', id)
      .eq('user_id', user!.id)
      .single();

    if (attendeeError || !attendee) {
      return res.status(404).json({ error: 'No estás registrado en este evento' });
    }

    // Eliminar asistente
    await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', id)
      .eq('user_id', user!.id);

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
  userId: number;
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

// ============================================
// SPA ROUTING - Todas las rutas no-API van al index.html
// ============================================
// Este middleware debe ir DESPUÉS de todas las rutas de API
// y DESPUÉS del middleware de archivos estáticos
if (fs.existsSync(STATIC_PATH)) {
  app.get('*', (req, res) => {
    // No interceptar rutas de API
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint no encontrado' });
    }
    
    // No interceptar WebSocket
    if (req.path.startsWith('/socket.io')) {
      return res.status(404).json({ error: 'WebSocket endpoint no encontrado' });
    }
    
    // Servir index.html para cualquier otra ruta (SPA routing)
    const indexPath = path.join(STATIC_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ 
        error: 'Frontend no encontrado',
        message: 'Ejecuta "npm run build" para generar el frontend'
      });
    }
  });
  
  console.log('✅ SPA routing configurado');
}

// ============================================
// INICIAR SERVIDOR
// ============================================
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en: http://localhost:${PORT}/api`);
  if (fs.existsSync(STATIC_PATH)) {
    console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
  }
  initializeDatabase();
  seedChatRooms();
});

export { app, io };
