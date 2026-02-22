# Configuración del Chat Vecinal

## Pasos para completar la configuración

### 1. Ejecutar SQL en Supabase

1. Ve a https://supabase.vecinoactivo.cl
2. Inicia sesión con las credenciales de administrador
3. Ve a "SQL Editor" en el menú lateral
4. Copia el contenido del archivo `server/supabase-tables.sql`
5. Pega el SQL en el editor y ejecútalo

Esto creará las tablas necesarias:
- `users` - Usuarios registrados
- `chat_rooms` - Salas de chat vecinales
- `chat_messages` - Mensajes del chat

### 2. Instalar dependencias del backend

```bash
cd server
npm install
```

### 3. Iniciar el servidor backend

```bash
cd server
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`

### 4. Iniciar el frontend (si no está corriendo)

```bash
cd ..
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

## Estructura del Backend

- `src/index.ts` - Servidor Express con Socket.io
- `src/routes/` - Rutas de la API
- `src/middleware/` - Middleware de autenticación
- `.env` - Variables de entorno del backend

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Chat
- `GET /api/chat/rooms` - Obtener salas de chat
- `POST /api/chat/rooms` - Crear sala de chat
- `GET /api/chat/rooms/:roomId/messages` - Obtener mensajes de una sala
- `POST /api/chat/rooms/:roomId/messages` - Enviar mensaje

### WebSocket
- `join_room` - Unirse a una sala de chat
- `send_message` - Enviar mensaje en tiempo real
- `new_message` - Recibir mensajes en tiempo real
